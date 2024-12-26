import { Column, DataType, Model, Table } from 'sequelize-typescript';

export const UserCDB = {
	ns: {
		uuid: () => ({ ns: 'u', pkfield: 'uuid' }),
	},
	nslist: {},
};

@Table({ tableName: 'users', timestamps: true, paranoid: true })
export class UserModel extends Model {
	@Column({ type: DataType.STRING, unique: true, allowNull: false })
	uuid: string;
	@Column({ type: DataType.STRING, unique: true, allowNull: false })
	username: string;
	@Column({ type: DataType.STRING, allowNull: false })
	password: string;
	@Column({ type: DataType.DATE, defaultValue: 0 })
	lastLoginAt: Date;
}
