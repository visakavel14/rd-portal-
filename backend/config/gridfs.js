import mongoose from "mongoose";
import Grid from "gridfs-stream";

let gfs;
let gridFSBucket;

export const initGridFS = (conn) => {
  gridFSBucket = new mongoose.mongo.GridFSBucket(conn.db, {
    bucketName: "uploads",
  });

  gfs = Grid(conn.db, mongoose.mongo);
  gfs.collection("uploads");

  console.log("✅ GridFS initialized");
};

export { gfs, gridFSBucket };
