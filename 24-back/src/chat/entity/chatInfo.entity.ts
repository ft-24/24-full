import { Column, Entity, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";

@Entity('ChatInfo')
export class ChatInfoEntity {
	@PrimaryGeneratedColumn('rowid')
	id: number;

	@Column()
	user_id: number;

	@Column()
	room_id: number;

	@Column({ default: false })
	ban: boolean;

	@Column({ nullable: true, default: null })
	mute: Date;

	@Column({ default: false })
	admin: boolean;
};