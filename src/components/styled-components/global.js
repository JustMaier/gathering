import { createGlobalStyle } from 'styled-components/macro'
import reset from 'styled-normalize'

export const GlobalStyle = createGlobalStyle`
  ${reset}
  /* Additional Reset */
  fieldset{
    margin:0;
    padding:0;
    border:none;
  }

  * {
    box-sizing:border-box;
  }

  body {
    font-family: 'Roboto', sans-serif;
    font-size:16px;
    color:#fff;
    background-color: #333;
    background-image: radial-gradient(circle farthest-side, #4d4d4d, #333);
    background-repeat: no-repeat;
    background-position: 50% 50%;
    min-height:100vh;
    max-width:100vw;
    margin:0 auto;
    padding:3px ${p => p.theme.sizes.gutter} 0;

    @media(min-width: ${p => p.theme.sizes.breakpoint}){
      max-width:${p => p.theme.sizes.container};
      padding-left:0px;
      padding-right:0px;
    }

    &:before{
      z-index:101;
      content: '';
      position:fixed;
      top:0;
      left:0;
      right:0;
      height:3px;
      background-color:${p => p.theme.colors.primary}
    }
  }
`
