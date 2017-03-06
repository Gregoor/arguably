import React from 'react'
import {Link} from 'react-router'
import styled, {css} from 'styled-components'

export const Card = styled.div`
  position: relative;
  z-index: 1;
  box-sizing: border-box;
  border-radius: 2px;
  margin-bottom: 16px;
  padding: 8px 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: #fff;
  font-size: 16px;
  font-weight: 400;
  box-shadow: 0 2px 2px 0 rgba(0,0,0,.14), 0 3px 1px -2px rgba(0,0,0,.2), 0 1px 5px 0 rgba(0,0,0,.12);
`

export const CardSection = styled.div`
  display: flex;
  margin: 0;
  padding: 8px 16px;
  line-height: 18px;
  overflow: hidden;
  color: rgba(0, 0, 0, .8);
  white-space: pre-line;
`

export const CardTitle = styled.h3`
  margin: 0;
  font-weight: 300;
  align-items: center;
  display: flex;
  justify-content: stretch;
  line-height: normal;
  padding: 8px 16px;
  perspective-origin: 165px 56px;
  transform-origin: 165px 56px;
  box-sizing: border-box;
  text-decoration: none;
`

const inputChunk = css`
  border-radius: 2px;
  border: lightgrey 1px solid;
  padding: 8px 16px;
  width: 100%;
`

export const FullWidthInput = styled.input`
  ${inputChunk}
`

export const PropositionLink = ({children, id, ...props}) => (
  <Link to={`/proposition/${id}`} {...props}>
    {children}
  </Link>
)

export const PropositionTitleLink = styled(PropositionLink)`
  color: black !important;
  text-decoration: none;
  
  &:hover {
    text-decoration: underline;
    cursor: pointer;
  }
`

export const TextArea = styled.textarea`
  ${inputChunk}
`

export const typeColors = {
  PRO: '#81C784',
  CONTRA: '#FF8A80'
}

export const Input = ({input, label, type, meta: {touched, error, warning}}) => (
  <div style={{display: 'flex', width: '100%'}}>
    <FullWidthInput {...input} type={type} placeholder={label}/>
    {touched && error && <div style={{color: typeColors.CONTRA}}>{error}</div>}
  </div>
)
