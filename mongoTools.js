import { MongoClient, ObjectId } from "mongodb";
import "dotenv/config";

const client = new MongoClient(process.env.MONGO_URI);
await client.connect();
const db = client.db();
const children = db.collection("children");
const attendance = db.collection("attendance");
const parents = db.collection("parents");

export const schoolTools = [
  {
    name: "getChildByName",
    description: "Get child details by name",
    func: async (input) => {
      const child = await children.findOne({ childName: input });
      return child ? JSON.stringify(child) : `Child ${input} not found.`;
    },
  },
  {
    name: "getAttendanceByChildAndDate",
    description: "Get attendance record by child name and date",
    func: async (input) => {
      const { childName, date } = JSON.parse(input);
      const child = await children.findOne({ childName });
      if (!child) return `No child found: ${childName}`;
      const record = await attendance.findOne({
        childId: new ObjectId(child._id),
        date,
      });
      return record
        ? JSON.stringify(record)
        : `No attendance for ${childName} on ${date}`;
    },
  },
  {
    name: "getAbsentListByDate",
    description: "List all absent children on a specific date",
    func: async (input) => {
      const records = await attendance
        .find({ date: input, pickup: false })
        .toArray();
      const childIds = records.map((rec) => rec.childId);
      const absentChildren = await children
        .find({ _id: { $in: childIds } })
        .toArray();
      return absentChildren.length
        ? absentChildren.map((c) => c.childName).join(", ")
        : `No absentees on ${input}`;
    },
  },
  {
    name: "getParentByChildName",
    description: "Get parent details by child's name",
    func: async (input) => {
      const child = await children.findOne({ childName: input });
      if (!child) return `No child found: ${input}`;
      const parent = await parents.findOne({ childId: child._id });
      return parent ? JSON.stringify(parent) : `No parent found for ${input}`;
    },
  },
];
