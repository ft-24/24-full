import { Column, Entity, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";

@Entity('FriendList')
export class FriendListEntity {
	@PrimaryGeneratedColumn('rowid')
	id: number;

	@Column()
	user_id: number;

	@Column()
	target_user_id: number;
};