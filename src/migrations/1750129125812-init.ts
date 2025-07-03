import { MigrationInterface, QueryRunner } from 'typeorm';

export class Init1750129125812 implements MigrationInterface {
  name = 'Init1750129125812';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`blog_user\` (\`id\` varchar(36) NOT NULL, \`create_by\` varchar(255) NULL COMMENT 'user ID of creator', \`update_by\` varchar(255) NULL COMMENT 'ID of use who last updated id', \`create_at\` datetime(6) NOT NULL COMMENT 'created time' DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NULL COMMENT 'updated time' DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`delete_at\` datetime(6) NULL COMMENT 'delete time', \`nick_name\` varchar(50) NULL COMMENT 'nick name', \`mobile_phone\` varchar(50) NULL COMMENT 'mobile phone number', \`email\` varchar(100) NULL COMMENT 'email', \`password\` varchar(255) NULL COMMENT 'password', \`avatar\` varchar(255) NULL COMMENT 'avatar', \`gender\` tinyint(1) NOT NULL COMMENT 'gender' DEFAULT '1', \`remark\` varchar(255) NULL COMMENT 'remark', \`last_login_time\` timestamp NULL COMMENT 'updated time', \`locale\` varchar(50) NULL COMMENT 'locale', PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`blog_test_user_entity\` (\`id\` int NOT NULL AUTO_INCREMENT, \`nick_name\` varchar(50) NULL, \`avatar\` varchar(255) NULL, \`gender\` varchar(1) NOT NULL DEFAULT '1', PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE \`blog_test_user_entity\``);
    await queryRunner.query(`DROP TABLE \`blog_user\``);
  }
}
