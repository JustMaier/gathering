import React from 'react'
import styled from 'styled-components/macro'
import { darken, lighten, rgba } from 'polished'
import { space } from 'styled-system'

const formStyleVariables = {
  inputBorder: p => lighten(0.1, p.theme.colors.bg),
  inputBg: p => lighten(0.02, p.theme.colors.bg),
  inputHover: p => lighten(0.05, p.theme.colors.bg),
  inputRadius: p => '5px'
}

export const Form = styled.form`
  display:block;
  width:100%;
`

export const Fieldset = styled.fieldset`
  ${space}
  box-shadow: 0px 1px 5px rgba(#000, .3);
  border-radius:$input-radius;

  & > div {
    input, textarea {
      border-radius: 0;
    }

    &:first-child{
      input, textarea {
        border-top-left-radius:${formStyleVariables.inputRadius};
        border-top-right-radius:${formStyleVariables.inputRadius};
      }
    }

    &:last-child{
      input, textarea {
        border-bottom-left-radius:${formStyleVariables.inputRadius};
        border-bottom-right-radius:${formStyleVariables.inputRadius};
      }
    }
  }
`

Fieldset.defaultProps = {
  mb: '4'
}

const FormGroup = (props) => (
  <div className={props.className}>
    <input id={props.name} type={props.type || 'text'} name={props.name} placeholder=' ' required={props.required} value={props.value} onChange={props.onChange} />
    <label htmlFor={props.name}>{props.label || props.name}</label>
  </div>
)

export const FloatLabelInput = styled(FormGroup)`
  position: relative;
  width: 100%;
  display: flex;

  label {
    position: absolute;
    top: 14px;
    left: 12px;
    line-height: 1;
    margin: 0;
    font-weight: 300;
    pointer-events: none;
    transition: 200ms ease all;
    z-index: 3;
    color: ${p => darken(0.3, p.theme.colors.text)};

    &.required {
      &:after {
        margin-left: 3px;
        content: '*';
        color: ${p => p.theme.colors.danger};
      }
    }
  }

  input, textarea {
    display: block;
    background-color: transparent;
    border: none;
    width: 100%;
    font-weight: 300;
    padding: 18px 12px 8px;
    border: 1px solid ${formStyleVariables.inputBorder};
    background: ${p => rgba(formStyleVariables.inputBg(p), 0.8)};
    color: inherit;
    position: relative;
    appearance: none;
    box-shadow: none;

    &:focus {
      box-shadow: none;
      border-color: ${p => p.theme.colors.primary};
      outline: none;
      z-index: 2;
    }

    &:focus, &:not(:placeholder-shown) {
      & ~ label {
        font-size: 10px;
        color: ${p => lighten(0.2, p.theme.colors.primary)};
        top: 6px;
        font-weight: 500;
        opacity: 1;

        &:after {
          display: none;
        }
      }

      &:invalid ~ label {
        color: ${p => p.theme.colors.danger};
      }

      &:valid ~ label:after {
        color: ${p => lighten(0.2, p.theme.colors.primary)};
      }
    }
  }

  & + & {
    input, textarea {
      margin-top: -1px;
    }
  }

  .addon {
    .btn {
      border-radius:0;
    }
  }
`
