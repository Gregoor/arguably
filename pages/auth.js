import _ from 'lodash';
import Router from 'next/router'
import React from 'react';
import Relay from 'react-relay';
import {connect} from 'react-redux'
import {formValueSelector, Field, reduxForm} from 'redux-form';

import AuthorizeMutation from '../mutations/authorize';
import {asSubmissionError} from '../client/helpers';
import Layout from '../components/layout';
import store from '../client/store';
import {Card, CardSection, CardTitle, Input} from '../components/ui'

const MIN_PASSWORD_LENGTH = 8;
const FORM_STORE_KEY = 'auth';


const authorize = (data) => new Promise((resolve, reject) => (
  Relay.Store.commitUpdate(new AuthorizeMutation(data), {
    onSuccess: ({login, register}) => {
      const data = login || register;
      store.dispatch({type: 'LOGIN', jwt: data.jwt});
      resolve(data);
      Router.push('/');
    },
    onFailure: (t) => reject(asSubmissionError(t, {
      name: {
        exists: 'Already exists',
        not_found: 'No user with this name found'
      },
      password: {invalid: 'Invalid'}
    }))
  })
));

const AuthPage = ({handleSubmit, invalid, isNew, viewer: user, ...props}) => (
  <Card style={{maxWidth: 300, margin: '0 auto'}}><form onSubmit={handleSubmit(authorize)}>
    <CardTitle>Authentication</CardTitle>
    <CardSection>
      <Field name="name" component={Input} type="text" label="Username"/>
    </CardSection>
    <CardSection>
      <label>
        <Field name="isNew" component="input" type="checkbox"/>
        I'm a new user
      </label>
    </CardSection>
    <CardSection>
      <Field name="password" component={Input} type="password" label="Password"/>
    </CardSection>
    {isNew && (
      <CardSection>
        <Field name="passwordRepeat" component={Input} type="password"
               label="Repeat Password"/>
      </CardSection>
    )}
    <CardSection>
      <button type="submit" disabled={invalid}>{!isNew ? 'Login' : 'Register'}</button>
    </CardSection>
  </form></Card>
);

export default () => Layout(_.flow([

  reduxForm({
    form: FORM_STORE_KEY,
    validate: ({isNew, name, password, passwordRepeat}) => {
      const errors = {};

      if (!name) {
        errors.name = 'Required';
      }
      if (!password) {
        errors.password = 'Required';
      }

      if (!isNew) return errors;
      if (!password || password.length < MIN_PASSWORD_LENGTH) {
        errors.password = `Has to be at least ${MIN_PASSWORD_LENGTH} characters long`;
      }
      if (password != passwordRepeat) {
        errors.passwordRepeat = 'Must match password';
      }
      return errors;
    }
  }),

  connect(
    (state) => ({isNew: formValueSelector(FORM_STORE_KEY)(state, 'isNew')})
  ),

  (AuthPage) => Relay.createContainer(AuthPage, {
    fragments: {viewer: () => Relay.QL`
      fragment on Viewer {
        user {
          name
        }
      }
    `}
  })

])(AuthPage));