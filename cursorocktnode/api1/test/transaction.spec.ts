import {expect, test,beforeAll, afterAll,describe, beforeEach} from 'vitest'
import {app} from '../src/app'
import request from 'supertest'
import {execSync} from 'node:child_process'
describe('Transaction Routes', () => {
  beforeAll(async () => {
    
    await app.ready()
    })
    
    afterAll(async () => {
        await app.close()
    })

    beforeEach(() => {
      execSync('npm run knex migrate:rollback --all')
      execSync('npm run knex migrate:latest')
    })
    
    test('o usuáro consegue criar uma nova transação', async () => {
      const response = await request(app.server).post('/transactions').send({
        title: 'Nova Transação',
        amount: 4000,
        type: 'credit',
       
      })
      expect(response.statusCode).toEqual(201)
    })



    test('Listar todas as transações', async () => {
      const createTransactonResponse = await request(app.server).post('/transactions').send({
        title: 'Nova Transação',
        amount: 4000,
        type: 'credit',
       
      })
      const cookies = createTransactonResponse.get('Set-Cookie')
     const listTransactionsResponse = await request(app.server).get('/transactions').set('Cookie',cookies).expect(200)
     expect(listTransactionsResponse.body.transactions).toEqual([
     expect.objectContaining({
      title: 'Nova Transação',
      amount: 4000,
     })
     ])
    })

    
    test('Listar uma transação especifica', async () => {
      const createTransactonResponse = await request(app.server).post('/transactions').send({
        title: 'Nova Transação',
        amount: 4000,
        type: 'credit',
       
      })
      const cookies = createTransactonResponse.get('Set-Cookie')
      const listTransactionsResponse = await request(app.server).get('/transactions').set('Cookie',cookies).expect(200)
     
     const transactionId = listTransactionsResponse.body.transactions[0].id
     const getTransactionsResponse = await request(app.server).get(`/transactions/${transactionId}`).set('Cookie',cookies).expect(200)
     
      expect(getTransactionsResponse.body.transaction).toEqual(
     expect.objectContaining({
      title: 'Nova Transação',
      amount: 4000,
     })
     )
    })



   test('Resumo', async () => {
      const createTransactonResponse = await request(app.server).post('/transactions').send({
        title: 'Transação Credito',
        amount: 5000,
        type: 'credit',
       
      })
      const cookies = createTransactonResponse.get('Set-Cookie')
     
       await request(app.server).post('/transactions').set('Cookie',cookies).send({
        title: 'Transação Debito',
        amount: 2000,
        type: 'debit',
       
      })

      const summaryResponse = await request(app.server).get('/transactions/summary').set('Cookie',cookies).expect(200)
     expect(summaryResponse.body.summary).toEqual({
      amount: 3000
     })
    
    })
})


 