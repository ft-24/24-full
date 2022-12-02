import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('DmList')
export class DmListEntity {
	@PrimaryGeneratedColumn('rowid')
	id: number;

	@Column()
	user1_id: number;

	@Column()
	user2_id: number;
}