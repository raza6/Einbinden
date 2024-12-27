import MongoDB from "../mongo/mongo";

export default class tagService {
  public static async getUserTags(userId: string): Promise<Array<string>> {
    try {
      const mongo = new MongoDB();
      const user = await mongo.getUser(userId)
      if (user === undefined) {
        console.log(`🧨 No user found for userId : ${userId}`);
        return [];
      } else {
        return user.tags;
      }
    } catch (error) {
      console.log(`🧨 Tag retrieval failed, reason : ${(<Error>error).message}`);
      return [];
    }
  }

  public static async addUserTag(tag: string, userId: string): Promise<boolean> {
    try {
      if (tag) {
        const mongo = new MongoDB();
        const user = await mongo.getUser(userId);

        if (user === undefined) {
          console.log(`🧨 No user found for userId : ${userId}`);
          return false;
        } else {
          mongo.addTag(tag, userId);
          return true;
        }
      } else {
        console.log(`🧨 Cannot add empty tag`);
        return false;
      }
    } catch (error) {
      console.log(`🧨 Tag add failed, reason : ${(<Error>error).message}`);
      return false;
    }
  }

  public static async deleteUserTag(tag: string, userId: string): Promise<boolean> {
    try {
      if (tag) {
        const mongo = new MongoDB();
        const user = await mongo.getUser(userId);
        
        if (user === undefined) {
          console.log(`🧨 No user found for userId : ${userId}`);
          return false;
        } else if (!user.tags.includes(tag)) {
          console.log(`🧨 Tag "${tag}" not found`);
          return false;
        } else {
          mongo.deleteTag(tag, userId);
          return true;
        }
      } else {
        console.log(`🧨 Cannot delete empty tag`);
        return false;
      }
    } catch (error) {
      console.log(`🧨 Tag delete failed, reason : ${(<Error>error).message}`);
      return false;
    }
  }
}
