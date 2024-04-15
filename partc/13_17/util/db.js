const Sequelize = require('sequelize')
const {Umzug, SequelizeStorage} = require('umzug')
const { DATABASE_URL } = require('./config')

//console.log('DATABASE_URL:', DATABASE_URL);
const sequelize = new Sequelize(DATABASE_URL, {
    dialect: 'postgres',
    ssl: true,
    dialectOptions: {
        ssl: {
            require: true,
            rejectUnauthorized: false
        }
    }
  });

  const runMigrations = async () => {
    const migrator = new Umzug({
      migrations: {
        glob: 'migrations/*.js',
      },
      storage: new SequelizeStorage({ sequelize, tableName: 'migrations' }),
      context: sequelize.getQueryInterface(),
      logger: console,
    })
    
    const migrations = await migrator.up()
    console.log('Migrations up to date', {
      files: migrations.map((mig) => mig.name),
    })
  }

const connectToDatabase = async () => {
  try {
    await sequelize.authenticate()
    await runMigrations()
    console.log('connected to the database')
  } catch (err) {
    console.log(err)
    return process.exit(1)
  }

  return null
}

module.exports = { connectToDatabase, sequelize }