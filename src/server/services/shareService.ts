import MongoDB from "../mongo/mongo";

export default class shareService {
  public static async getUserDetail(shareId: string): Promise<string | null> {
    try {
      const origin = shareId.slice(0,2);
      const userId = parseInt(shareId.slice(2), 16).toString(); // shareId is userId hex encoded 
      const mongo = new MongoDB();
      const user = await mongo.getUser(userId);
      if (user === undefined) {
        console.log(`🧨 No user found for shareId : ${shareId}`);
        return null;
      } else {
        return user.name;
      }
    } catch (error) {
      console.log(`🧨 User retrieval failed, reason : ${(<Error>error).message}`);
      return null;
    }
  }
}
