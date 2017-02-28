import Router from 'next/router';
import React, {Component} from 'react';
import styled from 'styled-components';

import {CardSection, typeColors} from '../ui';

export const PropositionLink = styled(
  ({children, id, ...props}) => (
    <div onClick={() => Router.push(`/proposition?id=${id}`)} {...props}>
      {children}
    </div>
  )
)`
  &:hover {
    text-decoration: underline;
    cursor: pointer;
  }
`;

export const StatsBar = styled(CardSection)`
  display: flex;
  justify-content: space-between;
  padding-top: 0;
`;

export const TypeTag = styled.span`
  margin-right: 16px;
  padding-bottom: 0;
  font-weight: bold;
  color: ${(props) => typeColors[props.type] || '#aab8c2'};
`;

export const TypeTagBar = styled(CardSection)`
  padding-bottom: 0;
`;
