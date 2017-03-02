import React from 'react';
import styled from 'styled-components';

import {CardSection, typeColors} from '../ui';


export const StatsBar = styled(CardSection)`
  display: flex;
  justify-content: space-between;
`;

export const SourceSection = ({children}) => (
  <CardSection>
    <b style={{marginRight: 5}}>Source:</b>
    {children}
  </CardSection>
);

export const TypeTag = styled.span`
  padding-bottom: 0;
  font-weight: bold;
  color: ${(props) => typeColors[props.type] || '#aab8c2'};
`;