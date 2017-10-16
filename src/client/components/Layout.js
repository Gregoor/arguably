import React from 'react'
import {createFragmentContainer, graphql} from 'react-relay'
import {Link} from 'react-router-dom'
import styled from 'styled-components'
import logout from '../logout'

const PageContainer = styled.div`
  margin: 0 auto;
  padding-top: 16px;
  max-width: 700px;
`

const Header = styled.div`
  margin-bottom: 16px;
  padding: 8px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`

const AppTitle = styled.h1`
  margin: 0;
  position: absolute;
  font-variant: small-caps;
  left: 50%;
  transform: translate(-50%, 0);
`

export default createFragmentContainer(
  ({children, viewer: {user}}) => (
    <PageContainer>
      <Header>
        <Link href="/"><a>View all Propositions</a></Link>
        <AppTitle>Arguably</AppTitle>
        {user
          ? (
            <div>
              Logged in as <b>{user.name}</b> (<a href="#logout" onClick={logout}>Logout</a>)
            </div>
          ) : <Link to="/auth"><a>Login/Register</a></Link>
        }
      </Header>
      {children}
    </PageContainer>
  ),
  {viewer: graphql`
    fragment Layout_viewer on Viewer {
      user {
        name
      }
    }
  `}
)
