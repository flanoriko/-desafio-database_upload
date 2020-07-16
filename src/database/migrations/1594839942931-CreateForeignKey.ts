import {MigrationInterface, QueryRunner,TableForeignKey} from "typeorm";

export class CreateForeignKey1594839942931 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.createForeignKey('transactions', new TableForeignKey({
            name: 'transaction_category_fk',
            columnNames: ['category_id'],
            referencedColumnNames: ['id'],
            referencedTableName: 'categories',
            onDelete: 'SET NULL',
            onUpdate: 'CASCADE'
        }));
    }
    

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.dropForeignKey('transactions', 'transaction_category_fk');
    }

}
