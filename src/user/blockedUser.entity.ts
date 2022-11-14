import { Column, Entity, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";

@Entity('BlockedUser')
export class BlockedUserEntity {
	@PrimaryGeneratedColumn('rowid')
	id: number;

	@Column()
	user_id: number;

	@Column()
	target_user_id: number; // 블락 당한 사람
};