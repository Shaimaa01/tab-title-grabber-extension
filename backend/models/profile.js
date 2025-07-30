import { DataTypes, Model } from "sequelize";
import sequelize from "../database.js";

class Profile extends Model {}

Profile.init(
  {
    name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    url: {
      type: DataTypes.STRING,
    },
    about: {
      type: DataTypes.TEXT,
    },
    bio: {
      type: DataTypes.TEXT,
    },
    location: {
      type: DataTypes.STRING,
    },
    followerCount: {
      type: DataTypes.STRING,
    },
    connectionCount: {
      type: DataTypes.STRING,
    },
  },
  {
    sequelize,
    modelName: "Profile",
  }
);

export default Profile;
