import { Column, Entity, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";

@Entity('ChatRoom')
export class ChatRoomsEntity {
	@PrimaryGeneratedColumn('rowid')
	id: number;

	@Column()
	user_id: number;

	@Column()
	room_id: number;

	@Column()
	ban: boolean;

	@Column()
	mute: Date;

	@Column()
	admin: boolean;
};