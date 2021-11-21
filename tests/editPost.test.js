/* eslint-disable no-underscore-dangle */
/* eslint-disable no-unused-expressions */
/* eslint-disable mocha/no-mocha-arrows */
const chai = require('chai');
const chaiHttp = require('chai-http');
const sinon = require('sinon');
const { expect } = require('chai');
const { MongoClient } = require('mongodb');
const server = require('../src/app');
const { getConnection } = require('./connectionMock');

chai.use(chaiHttp);

describe('PUT /posts/:id', () => {
  let connectionMock;
  let token;
  let post;

  before(async () => {
    connectionMock = await getConnection();
    sinon.stub(MongoClient, 'connect').resolves(connectionMock);
    const userCollection = connectionMock.db('myFirstDatabase').collection('users');

      await userCollection.insertOne({
        name: 'Test',
        email: 'test@email.com',
        password: '123456',
      });

      token = await chai.request(server).post('/login').send({
        email: 'test@email.com',
        password: '123456',
      });

      post = await chai.request(server).post('/posts').send({
        title: 'Lorem Ipsum',
        description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis tempor moles.',
      }).set('authorization', token.body.token);
  });

  after(async () => {
    await connectionMock.db('myFirstDatabase').dropDatabase();
    MongoClient.connect.restore();
  });

  describe('When user is not logged in', () => {
    let response;

    before(async () => {
      response = await chai.request(server).put(`/posts/${post.body.id}`).send({
        title: 'Upadated',
        description: 'Lorem ipsum dolor sit amet',
      });
    });

    it('returns status code "401"', () => {
      expect(response).to.have.status(401);
    });
    it('returns an object', () => {
      expect(response.body).to.be.an('object');
    });
    it('the object has property "message"', () => {
      expect(response.body).to.have.property('message');
    });
    it('property "message" has value "Missing auth token"', () => {
      expect(response.body.message).to.be.equal('Missing auth token');
    });
  });

  describe('when token is invalid', () => {
    let response;

    before(async () => {
      response = await chai.request(server).put(`/posts/${post.body.id}`).send({
        title: 'Upadated',
        description: 'Lorem ipsum dolor sit amet',
      }).set('authorization', 'jasd545g4456s4f8f4s645g8d');
    });

    it('returns status code "401"', () => {
      expect(response).to.have.status(401);
    });
    it('returns an object', () => {
      expect(response.body).to.be.an('object');
    });
    it('the object has property "message"', () => {
      expect(response.body).to.have.property('message');
    });
    it('property "message" has value "JWT malformed"', () => {
      expect(response.body.message).to.be.equal('JWT malformed');
    });
  });

  describe('when id is invalid', () => {
    let response;

    before(async () => {
      response = await chai.request(server).put('/posts/f4s45f48gssf85s5g').send({
        title: 'Upadated',
        description: 'Lorem ipsum dolor sit amet',
      }).set('authorization', token.body.token);
    });

    it('returns status code "404"', () => {
      expect(response).to.have.status(404);
    });
    it('returns an object', () => {
      expect(response.body).to.be.an('object');
    });
    it('the object has property "message"', () => {
      expect(response.body).to.have.property('message');
    });
    it('property "message" has value "Post not found"', () => {
      expect(response.body.message).to.be.equal('Post not found');
    });
  });
});