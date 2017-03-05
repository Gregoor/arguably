import React from 'react';
import styled from 'styled-components';

import {FullWidthInput} from '../ui';

import searchIcon from './ic_search_black_24px.svg';

const Container = styled.div`
  position: relative;
  display: flex;
  padding-bottom: 16px;
`;

const Input = styled(FullWidthInput)`
  border: none;
  box-shadow: 0 2px 2px 0 rgba(0,0,0,0.16), 0 0 0 1px rgba(0,0,0,0.08);
  transition: box-shadow 200ms cubic-bezier(0.4, 0.0, 0.2, 1);
  
  &:focus, &:hover {
    outline: none;
    box-shadow: 0 3px 8px 0 rgba(0,0,0,0.2), 0 0 0 1px rgba(0,0,0,0.08);
  }
`;

const ImageContainer = styled.span`
  position: absolute;
  top: 24px;
  right: 16px;
  width: 20px;
`;

export default (props) => (
  <Container>
    <Input placeholder="Search" {...props}/>
    <ImageContainer dangerouslySetInnerHTML={{__html: searchIcon}}/>
  </Container>
);