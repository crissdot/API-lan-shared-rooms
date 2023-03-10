import { Sequelize } from 'sequelize';
import { definePost } from './Post';
import { defineFilePost } from './FilePost';
import { defineUser } from './User';
import { MODELS, FOREIGN_KEYS } from '../constants/DBNames';

const setupModels = async (sequelize: Sequelize) => {
  const UserModel = defineUser(sequelize);
  const PostModel = definePost(sequelize);
  const FilePostModel = defineFilePost(sequelize);

  // Relations
  UserModel.hasMany(PostModel, {as: MODELS.Post.tableName.plural, foreignKey: FOREIGN_KEYS.postBelongsToUser});
  PostModel.belongsTo(UserModel, {as: MODELS.User.tableName.singular});

  PostModel.hasMany(FilePostModel, {
    as: MODELS.FilePost.tableName.plural,
    foreignKey: FOREIGN_KEYS.filePostBelongsToPost,
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  });
  FilePostModel.belongsTo(PostModel, {
    as: MODELS.Post.tableName.singular,
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  });

  // Don't use force in production
  return sequelize.sync({ force: false });
}

export { setupModels };
