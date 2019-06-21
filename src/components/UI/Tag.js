import styled, { css } from 'styled-components/macro'
import { lighten, rgba } from 'polished'
import { space } from 'styled-system'

export const TagList = styled.div`
  display:flex;
  flex-wrap: wrap;
  margin: -2.5px;
  ${space}
`

TagList.propTypes = {
  ...space.propTypes
}

export const Tag = styled.div`
  display:flex;
  align-items:center;
  user-select:none;
  svg {
    margin-left:5px;
  }
  padding: 5px 8px;
  cursor: pointer;
  background: ${p => rgba(lighten(0.05, p.theme.colors.bg), 0.95)};
  border: 1px solid rgba(255,255,255, .1);
  ${p => p.active ? css`
    background: ${p => rgba(lighten(0.20, p.theme.colors.bg), 0.95)};
  ` : null}
  ${p => p.band ? css`
    border-left: 3px solid ${p.band};
  ` : null}

  ${TagList} & {
    margin: 2.5px;
  }
`
