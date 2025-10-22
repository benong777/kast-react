import styled from 'styled-components';

export const StyledButton = styled.button`
  font-family: inherit;
  background: blue;
  color: #fff;
  border: none;
  padding: 0.7em 1.5em;
  margin: 0.3em .45em 1.5em 0.05em;
  border-radius: 8px;
  font-size: .8em;
  box-shadow: 0 2px 7px rgba(108, 99, 255, 0.05);
  cursor: pointer;
  font-style: normal;

  /* Italic when disabled */
  &:disabled {
    background: gray;
    font-style: italic;
  }
`