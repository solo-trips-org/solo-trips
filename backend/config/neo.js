import neo4j from "neo4j-driver";

const NEO4J_URI = process.env.NEO4J_URI || "neo4j://localhost:7687";
const NEO4J_USER = process.env.NEO4J_USER || "neo4j";
const NEO4J_PASSWORD = process.env.NEO4J_PASSWORD || "password";

// Create driver instance
export const driver = neo4j.driver(
  NEO4J_URI,
  neo4j.auth.basic(NEO4J_USER, NEO4J_PASSWORD)
);

// Function to get a session
export function getSession(database = "neo4j") {
  console.log(`Neo4j connected to ${NEO4J_URI}`);
  return driver.session({ database });
}
