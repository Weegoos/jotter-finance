'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Budget', 'status', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: 'inactive',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Budget', 'status');
  },
};
