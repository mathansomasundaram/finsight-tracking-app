import { generateAllTestData, getSeedDataSummary } from './seedData'

const seedData = generateAllTestData({ verbose: false })
const summary = getSeedDataSummary(seedData)

console.log('Seed data preview')
console.log('=================')

summary.testUsers.forEach((user, index) => {
  console.log(`${index + 1}. ${user.name} <${user.email}>`)
  console.log(`   Profile: ${user.profile}`)
})

console.log('')
console.log(`Transactions: ${summary.dataVolume.totalTransactions}`)
console.log(`Assets: ${summary.dataVolume.totalAssets}`)
console.log(`Liabilities: ${summary.dataVolume.totalLiabilities}`)
console.log(`Goals: ${summary.dataVolume.totalGoals}`)
console.log('')
console.log('This script is backend-agnostic. Persist the generated data with the provider adapter you choose.')
