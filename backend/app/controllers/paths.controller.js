// controllers/path.controller.js
import mongoose from "mongoose";
import { getSession } from "../../config/neo.js";

/**
 * Ensure a Place node exists in Neo4j
 */
async function ensurePlace(session, placeId) {
  if (!mongoose.Types.ObjectId.isValid(placeId)) {
    throw new Error("Invalid place ObjectId");
  }

  const query = `
    MERGE (p:Place {mongoId: $placeId})
    RETURN p
  `;

  const result = await session.run(query, { placeId });
  return result.records[0]?.get("p").properties;
}

/**
 * Create a Path (relationship) between two places
 */
export const createPath = async (req, res) => {
  const { fromPlaceId, toPlaceId, mode, distance, isOneway, direction } = req.body;

  const session = getSession();
  try {
    // Ensure both places exist
    await ensurePlace(session, fromPlaceId);
    await ensurePlace(session, toPlaceId);

    let query = "";

    if (direction === "both") {
      // Create both directions
      query = `
        MATCH (a:Place {mongoId: $fromId}), (b:Place {mongoId: $toId})
        MERGE (a)-[r1:PATH_TO {
          mode: $mode,
          distance: $distance,
          isOneway: $isOneway
        }]->(b)
        MERGE (b)-[r2:PATH_TO {
          mode: $mode,
          distance: $distance,
          isOneway: $isOneway
        }]->(a)
        RETURN a, b, r1, r2
      `;
    } else if (direction === "from") {
      // Only fromPlace -> toPlace
      query = `
        MATCH (a:Place {mongoId: $fromId}), (b:Place {mongoId: $toId})
        MERGE (a)-[r:PATH_TO {
          mode: $mode,
          distance: $distance,
          isOneway: $isOneway
        }]->(b)
        RETURN a, b, r
      `;
    } else if (direction === "to") {
      // Only toPlace -> fromPlace
      query = `
        MATCH (a:Place {mongoId: $fromId}), (b:Place {mongoId: $toId})
        MERGE (b)-[r:PATH_TO {
          mode: $mode,
          distance: $distance,
          isOneway: $isOneway
        }]->(a)
        RETURN a, b, r
      `;
    } else {
      throw new Error("Invalid direction. Must be 'both', 'from', or 'to'.");
    }

    const result = await session.run(query, {
      fromId: fromPlaceId,
      toId: toPlaceId,
      mode,
      distance,
      isOneway,
    });

    // return all created relationships
    const response = result.records.map(record => ({
      from: record.get("a").properties,
      to: record.get("b").properties,
      path: record.has("r") ? record.get("r").properties : null,
      path1: record.has("r1") ? record.get("r1").properties : null,
      path2: record.has("r2") ? record.get("r2").properties : null,
    }));

    res.status(201).json(response);
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    await session.close();
  }
};


/**
 * Get all Paths with their Places
 */
export const getPaths = async (req, res) => {
  const session = getSession();
  try {
    const query = `
      MATCH (a:Place)-[r:PATH_TO]->(b:Place)
      RETURN a, r, b
    `;
    const result = await session.run(query);

    const paths = result.records.map((rec) => ({
      from: rec.get("a").properties,
      to: rec.get("b").properties,
      path: rec.get("r").properties,
    }));

    res.json(paths);
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    await session.close();
  }
};

/**
 * Update a Path
 */
export const updatePath = async (req, res) => {
  const { fromPlaceId, toPlaceId, updates } = req.body;
  const { mode, distance, isOneway, direction } = updates;

  const session = getSession();
  try {
    const query = `
      MATCH (a:Place {mongoId: $fromId})-[r:PATH_TO]->(b:Place {mongoId: $toId})
      SET r += {
        mode: coalesce($mode, r.mode),
        distance: coalesce($distance, r.distance),
        isOneway: coalesce($isOneway, r.isOneway),
        direction: coalesce($direction, r.direction)
      }
      RETURN a, r, b
    `;

    const result = await session.run(query, {
      fromId: fromPlaceId,
      toId: toPlaceId,
      mode,
      distance,
      isOneway,
      direction,
    });

    if (result.records.length === 0) {
      return res.status(404).json({ error: "Path not found" });
    }

    const record = result.records[0];
    res.json({
      from: record.get("a").properties,
      to: record.get("b").properties,
      path: record.get("r").properties,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    await session.close();
  }
};

/**
 * Delete a Path
 */
export const deletePath = async (req, res) => {
  const { fromPlaceId, toPlaceId } = req.body;
  const session = getSession();
  try {
    const query = `
      MATCH (a:Place {mongoId: $fromId})-[r:PATH_TO]->(b:Place {mongoId: $toId})
      DELETE r
      RETURN COUNT(r) AS deleted
    `;

    const result = await session.run(query, {
      fromId: fromPlaceId,
      toId: toPlaceId,
    });

    const deleted = result.records[0].get("deleted").toNumber();
    if (deleted === 0) {
      return res.status(404).json({ error: "Path not found" });
    }

    res.json({ message: "Path deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    await session.close();
  }
};


/**
 * Find optimal path including user-defined waypoints
 * Query: fromPlaceId, toPlaceId, waypoints=[id1,id2,...], mode (optional)
 */
export const findOptimalPathWithWaypoints = async (req, res) => {
  let { fromPlaceId, toPlaceId, waypoints, mode } = req.body;

  // Validate inputs
  const allIds = [fromPlaceId, ...(waypoints || []), toPlaceId];
  if (!allIds.every(id => mongoose.Types.ObjectId.isValid(id))) {
    return res.status(400).json({ error: "Invalid ObjectId(s)" });
  }

  // Normalize waypoints array
  if (!Array.isArray(waypoints)) waypoints = [];

  const session = getSession();
  try {
    let totalDistance = 0;
    let fullPlaces = [];
    let fullSegments = [];

    // Build sequence: start → waypoints → end
    const stops = [fromPlaceId, ...waypoints, toPlaceId];

    for (let i = 0; i < stops.length - 1; i++) {
      const startId = stops[i];
      const endId = stops[i + 1];

      const query = `
        MATCH (start:Place {mongoId: $fromId}), (end:Place {mongoId: $toId})
        CALL gds.shortestPath.dijkstra.stream({
          sourceNode: start,
          targetNode: end,
          relationshipProjection: {
            PATH_TO: {
              type: "PATH_TO",
              properties: ["distance","mode","isOneway","direction"],
              orientation: "NATURAL"
            }
          },
          nodeProjection: "Place",
          relationshipWeightProperty: "distance"
        })
        YIELD totalCost, path
        RETURN totalCost, 
               [node IN nodes(path) | node.mongoId] AS places,
               [rel IN relationships(path) | {
                 from: startNode(rel).mongoId,
                 to: endNode(rel).mongoId,
                 mode: rel.mode,
                 distance: rel.distance,
                 isOneway: rel.isOneway,
                 direction: rel.direction
               }] AS segments
        LIMIT 1
      `;

      const result = await session.run(query, {
        fromId: startId,
        toId: endId,
        mode,
      });

      if (result.records.length === 0) {
        return res.status(404).json({ error: `No path found from ${startId} → ${endId}` });
      }

      const record = result.records[0];
      const segmentDistance = record.get("totalCost");
      const segmentPlaces = record.get("places");
      const segmentSegments = record.get("segments");

      totalDistance += segmentDistance;

      // Merge places (avoid duplicating overlap at boundaries)
      if (fullPlaces.length > 0) {
        fullPlaces.pop(); // remove last place to avoid duplication
      }
      fullPlaces.push(...segmentPlaces);

      fullSegments.push(...segmentSegments);
    }

    res.json({
      totalDistance,
      places: fullPlaces,
      segments: fullSegments,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    await session.close();
  }
};
