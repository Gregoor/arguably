import React from 'react';
import styled from 'styled-components';

import {FullWidthInput} from './ui';


const SearchInput = styled(FullWidthInput)`
  border: none;
  box-shadow: 0 2px 2px 0 rgba(0,0,0,0.16), 0 0 0 1px rgba(0,0,0,0.08);
  transition: box-shadow 200ms cubic-bezier(0.4, 0.0, 0.2, 1);
  
  &:focus, &:hover {
    outline: none;
    box-shadow: 0 3px 8px 0 rgba(0,0,0,0.2), 0 0 0 1px rgba(0,0,0,0.08);
  }
`;

export default (props) => (
  <div style={{display: 'flex', padding: '16px 0'}}>
    <SearchInput placeholder="Search" {...props}/>
  </div>
);