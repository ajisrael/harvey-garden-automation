import chai from 'chai';

const should = chai.should();

const checkNewlyRegisteredUserData = (data, user) => {
  data.name.should.be.a('string');
  data.email.should.be.a('string');
  data.token.should.be.a('string');
  data.name.should.eql(user.name);
  data.email.should.eql(user.email);
};

const checkUsersData = (data, name, email) => {
  data._id.should.be.a('number');
  data.name.should.be.a('string');
  data.email.should.be.a('string');
  data.isAdmin.should.be.a('boolean');
  data.token.should.be.a('string');
  data.name.should.eql(name);
  data.email.should.eql(email);
};

const checkValidationResponse = (body, expectedMessage) => {
  body.should.be.a('object');
  body.message.should.be.a('string');
  body.stack.should.be.a('string');
  body.message.should.eql(expectedMessage);
};

export {
  checkNewlyRegisteredUserData,
  checkUsersData,
  checkValidationResponse,
};
