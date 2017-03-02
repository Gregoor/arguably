import React from 'react';
import styled, {injectGlobal} from 'styled-components';

// eslint-disable-next-line
injectGlobal`
  html > body {
    font-family: 'Roboto', 'Helvetica', 'Arial', sans-serif !important;
    background-color: #FAFAFA;
    width: 100%;
    min-height: 100%;
    margin: 0;
  }
  html, body {
    font-family: 'Helvetica', 'Arial', sans-serif;
    font-size: 14px;
    font-weight: 400;
    line-height: 20px;
  }
  
  a:-webkit-any-link {
    color: #1976D2;
  }
`;

export const Card = styled.div`
  position: relative;
  z-index: 1;
  box-sizing: border-box;
  border-radius: 2px;
  margin-bottom: 16px;
  padding: 8px 16px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: #fff;
  font-size: 16px;
  font-weight: 400;
  box-shadow: 0 2px 2px 0 rgba(0,0,0,.14), 0 3px 1px -2px rgba(0,0,0,.2), 0 1px 5px 0 rgba(0,0,0,.12);
`;

export const CardSection = styled.div`
  display: flex;
  margin: 0;
  padding: 8px 0;
  line-height: 18px;
  overflow: hidden;
  color: rgba(0, 0, 0, .8);
  white-space: pre-line;
`;

export const CardTitle = styled.h3`
  margin: 0;
  font-weight: 300;
  align-items: center;
  display: flex;
  justify-content: stretch;
  line-height: normal;
  padding: 8px 0;
  perspective-origin: 165px 56px;
  transform-origin: 165px 56px;
  box-sizing: border-box;
  text-decoration: none;
`;

export const FullWidthInput = styled.input`
  width: 100%;
`;

export const typeColors = {
  PRO: '#81C784',
  CONTRA: '#FF8A80'
};

export const Input = ({input, label, type, meta: {touched, error, warning}}) => (
  <div style={{width: '100%'}}>
    <FullWidthInput {...input} type={type} placeholder={label}/>
    {touched && error && <div style={{color: typeColors.CONTRA}}>{error}</div>}
  </div>
);