import { MigrationInterface, QueryRunner } from "typeorm";

export class Auto1757490981977 implements MigrationInterface {
    name = 'Auto1757490981977'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`blog_user\` (\`id\` varchar(36) NOT NULL, \`create_by\` varchar(255) NULL COMMENT 'user ID of creator', \`update_by\` varchar(255) NULL COMMENT 'ID of use who last updated id', \`create_at\` datetime(6) NOT NULL COMMENT 'created time' DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NULL COMMENT 'updated time' DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`delete_at\` datetime(6) NULL COMMENT 'delete time', \`nick_name\` varchar(50) NULL COMMENT 'nick name', \`mobile_phone\` varchar(50) NULL COMMENT 'mobile phone number', \`email\` varchar(100) NULL COMMENT 'email', \`password\` varchar(255) NULL COMMENT 'password', \`avatar\` varchar(255) NULL COMMENT 'avatar', \`gender\` tinyint(1) NULL COMMENT 'gender' DEFAULT '1', \`remark\` varchar(255) NULL COMMENT 'remark', \`last_login_time\` timestamp NULL COMMENT 'updated time', \`locale\` varchar(50) NULL COMMENT 'locale', \`github_id\` varchar(255) NULL, \`registerType\` tinyint(1) NULL COMMENT '注册方式，0-邮箱密码, 1-google 2-github', PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`blog_test_user_entity\` (\`id\` int NOT NULL AUTO_INCREMENT, \`nick_name\` varchar(50) NULL, \`avatar\` varchar(255) NULL, \`gender\` varchar(1) NOT NULL DEFAULT '1', PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`blog_file_entity\` (\`id\` varchar(36) NOT NULL, \`create_by\` varchar(255) NULL COMMENT 'user ID of creator', \`update_by\` varchar(255) NULL COMMENT 'ID of use who last updated id', \`create_at\` datetime(6) NOT NULL COMMENT 'created time' DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NULL COMMENT 'updated time' DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`delete_at\` datetime(6) NULL COMMENT 'delete time', \`status\` tinyint(1) NOT NULL DEFAULT '0', \`origin_name\` tinytext NOT NULL COMMENT '原始文件名', \`bucket_name\` tinytext NOT NULL COMMENT '存储桶名', \`object_name\` tinytext NOT NULL COMMENT 'OSS中的路径', \`sign_url\` tinytext NULL COMMENT '签名地址，给用户进行访问', \`is_public\` tinyint(1) NOT NULL COMMENT '是否为公共文件', \`size\` int NULL COMMENT '文件大小', \`mine_type\` tinytext NULL COMMENT '文件类型', \`uploader_id\` varchar(255) NOT NULL COMMENT '上传用户id', \`meta_data\` text NULL COMMENT '自定义元数据', \`expire_at\` tinyint NULL COMMENT '签名地址过期时间', PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE \`blog_file_entity\``);
        await queryRunner.query(`DROP TABLE \`blog_test_user_entity\``);
        await queryRunner.query(`DROP TABLE \`blog_user\``);
    }

}
