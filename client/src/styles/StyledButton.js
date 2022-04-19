import styled from 'styled-components/macro';

const StyledChatButton = styled.p`
    position: absolute;
    top: var(--spacing-sm);
    left: var(--spacing-md);
    padding: var(--spacing-xs) var(--spacing-sm);
    background-color: rgba(0,0,0,.7);
    color: var(--white);
    font-size: var(--fsize-sm);
    font-weight: 700;
    border-radius: var(--border-radius-pill);
    z-index: 10;
    @media (min-width: 768px) {
        left: var(--spacing-lg);
    }
`;

export default StyledChatButton