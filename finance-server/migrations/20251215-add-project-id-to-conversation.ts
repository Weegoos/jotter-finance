import { QueryInterface, DataTypes } from 'sequelize';

export default {
  async up(queryInterface: QueryInterface) {
    await queryInterface.addColumn('Conversation', 'project_id', {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'Project',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });
  },

  async down(queryInterface: QueryInterface) {
    await queryInterface.removeColumn('Conversation', 'project_id');
  },
};
