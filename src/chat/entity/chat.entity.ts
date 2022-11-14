import { Column, Entity, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";

@Entity('Chat')
export class ChatEntity {
	@PrimaryGeneratedColumn('rowid')
	id: number;

	@Column()
	room_id: number;

	@Column()
	sender: number;

	@Column()
	chat: string;

	@Column()
	time: Date;
};