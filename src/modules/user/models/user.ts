import { Table, Column, Model, DataType } from 'sequelize-typescript';
import { getBaseTagStore, Tag, TAG_COMMON } from 'me-cache-db';

//
export const UserCDB = {
	tags: { ...getBaseTagStore() },
	ns: {
		uuid: () => ({ ns: 'u', pkfield: 'uuid' }),
	},
	nslist: {},
	nsref: {},
};

@Table({ tableName: 'users', timestamps: true, paranoid: true })
export class UserModel extends Model {
	@Column({ type: DataType.STRING, unique: true, allowNull: false })
	@Tag(UserCDB.tags, TAG_COMMON)
	uuid: string;

	@Column({ type: DataType.STRING, unique: true, allowNull: false })
	@Tag(UserCDB.tags, TAG_COMMON)
	username: string;

	@Column({ type: DataType.STRING, allowNull: false })
	@Tag(UserCDB.tags)
	password: string;

	@Column({ type: DataType.DATE, defaultValue: 0 })
	@Tag(UserCDB.tags, TAG_COMMON)
	lastLoginAt: Date;
}
