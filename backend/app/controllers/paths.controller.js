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
 * Refresh GDS in-memory graph
 */
async function refreshGDSGraph(session) {
  const query = `
    CALL gds.graph.exists('placesGraph') YIELD exists
    WITH exists
    CALL apoc.do.when(
      exists,
      'CALL gds.graph.drop("placesGraph") YIELD graphName RETURN graphName',
      '',
      {}
    ) YIELD value
    CALL gds.graph.project(
      'placesGraph',
      'Place',
      {
        PATH_TO: {
          type: 'PATH_TO',
          properties: ['distance'], // only numeric
          orientation: 'NATURAL'
        }
      }
    )
    YIELD graphName
    RETURN graphName
  `;
  await session.run(query);
}

/**
 * Create a Path (relationship) between two places
 */
export const createPath = async (req, res) => {
  const { fromPlaceId, toPlaceId, mode, distance, direction, roadId } = req.body;
  const session = getSession();
  try {
    await ensurePlace(session, fromPlaceId);
    await ensurePlace(session, toPlaceId);

    let query = "";

    if (direction === "both") {
      query = `
        MATCH (a:Place {mongoId: $fromId}), (b:Place {mongoId: $toId})
        MERGE (a)-[r1:PATH_TO {
          mode: $mode,
          distance: $distance,
          roadId: $roadId
        }]->(b)
        MERGE (b)-[r2:PATH_TO {
          mode: $mode,
          distance: $distance,
          roadId: $roadId
        }]->(a)
        RETURN a, b, r1, r2
      `;
    } else if (direction === "from") {
      query = `
        MATCH (a:Place {mongoId: $fromId}), (b:Place {mongoId: $toId})
        MERGE (a)-[r:PATH_TO {
          mode: $mode,
          distance: $distance,
          roadId: $roadId
        }]->(b)
        RETURN a, b, r
      `;
    } else if (direction === "to") {
      query = `
        MATCH (a:Place {mongoId: $fromId}), (b:Place {mongoId: $toId})
        MERGE (b)-[r:PATH_TO {
          mode: $mode,
          distance: $distance,
          roadId: $roadId
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
      roadId,
    });

    await refreshGDSGraph(session);

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
    const query = `MATCH (a:Place)-[r:PATH_TO]->(b:Place) RETURN a, r, b`;
    const result = await session.run(query);
    const paths = result.records.map(rec => ({
      from: rec.get("a").properties,
      to: rec.get("b").properties,
      path: rec.get("r").properties
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
  const { mode, distance, direction, roadId } = updates;
  const session = getSession();
  try {
    const query = `
      MATCH (a:Place {mongoId: $fromId})-[r:PATH_TO]->(b:Place {mongoId: $toId})
      SET r += {
        mode: coalesce($mode, r.mode),
        distance: coalesce($distance, r.distance),
        roadId: coalesce($roadId, r.roadId)
      }
      RETURN a, r, b
    `;

    const result = await session.run(query, {
      fromId: fromPlaceId,
      toId: toPlaceId,
      mode,
      distance,
      roadId,
    });

    if (result.records.length === 0) {
      return res.status(404).json({ error: "Path not found" });
    }

    await refreshGDSGraph(session);

    const record = result.records[0];
    res.json({
      from: record.get("a").properties,
      to: record.get("b").properties,
      path: record.get("r").properties
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
    const result = await session.run(query, { fromId: fromPlaceId, toId: toPlaceId });
    const deleted = result.records[0].get("deleted").toNumber();
    if (deleted === 0) return res.status(404).json({ error: "Path not found" });

    await refreshGDSGraph(session);

    res.json({ message: "Path deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    await session.close();
  }
};

/**
 * Ensure GDS graph exists
 */
async function ensureGDSGraph(session) {
  const checkQuery = `CALL gds.graph.exists('placesGraph') YIELD exists RETURN exists`;
  const result = await session.run(checkQuery);
  const exists = result.records[0].get('exists');
  if (!exists) {
    await session.run(`
      CALL gds.graph.project(
        'placesGraph',
        'Place',
        {
          PATH_TO: {
            type: 'PATH_TO',
            properties: ['distance','mode','roadId'],
            orientation: 'NATURAL'
          }
        }
      )
    `);
  }
}

/**
 * Find optimal path including user-defined waypoints
 */
export const findOptimalPathWithWaypoints = async (req, res) => {
  let { fromPlaceId, toPlaceId, waypoints } = req.body;
  const allIds = [fromPlaceId, ...(waypoints || []), toPlaceId];
  if (!allIds.every(id => mongoose.Types.ObjectId.isValid(id))) {
    return res.status(400).json({ error: "Invalid ObjectId(s)" });
  }
  if (!Array.isArray(waypoints)) waypoints = [];

  const session = getSession();
  await ensureGDSGraph(session);

  try {
    let totalDistance = 0;
    let fullPlaces = [];
    let fullSegments = [];

    const stops = [fromPlaceId, ...waypoints, toPlaceId];

    for (let i = 0; i < stops.length - 1; i++) {
      const startId = stops[i];
      const endId = stops[i + 1];

      const query = `
        MATCH (start:Place {mongoId: $fromId}), (end:Place {mongoId: $toId})
        WITH id(start) AS startId, id(end) AS endId
        CALL gds.shortestPath.dijkstra.stream('placesGraph', {
          sourceNode: startId,
          targetNode: endId,
          relationshipWeightProperty: 'distance'
        })
        YIELD totalCost, nodeIds, path
        RETURN totalCost,
               [nodeId IN nodeIds | gds.util.asNode(nodeId).mongoId] AS places,
               [rel IN relationships(path) | {
                 from: startNode(rel).mongoId,
                 to: endNode(rel).mongoId,
                 mode: rel.mode,
                 distance: rel.distance,
                 roadId: rel.roadId
               }] AS segments
        LIMIT 1
      `;

      const result = await session.run(query, { fromId: startId, toId: endId });
      if (result.records.length === 0) {
        return res.status(404).json({ error: `No path found from ${startId} → ${endId}` });
      }

      const record = result.records[0];
      const segmentDistance = record.get("totalCost");
      const segmentPlaces = record.get("places");
      const segmentSegments = record.get("segments");

      totalDistance += segmentDistance;
      if (fullPlaces.length > 0) fullPlaces.pop();
      fullPlaces.push(...segmentPlaces);
      fullSegments.push(...segmentSegments);
    }

    res.json({
      totalDistance,
      places: fullPlaces,
      segments: fullSegments
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    await session.close();
  }
};
