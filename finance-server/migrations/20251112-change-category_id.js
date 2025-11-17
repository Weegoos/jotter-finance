'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Переименование колонки в таблице "Budget"
    await queryInterface.renameColumn('Budget', 'categoryId', 'category_id');
  },

  async down(queryInterface, Sequelize) {
    // Откат переименования
    await queryInterface.renameColumn('Budget', 'category_id', 'categoryId');
  },
};
