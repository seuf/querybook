// Modified from https://github.com/craftzdog/react-codemirror-runmode
import classNames from 'classnames';
import React, { useMemo } from 'react';
import styled from 'styled-components';

import CodeMirror from 'lib/codemirror';
import 'codemirror/lib/codemirror.css';

interface IProps {
    className?: string;
    theme?: string;
    prefix?: string;
    inline?: boolean;
    language?: string;

    value: string;
}

const CodeHighlightContainer = styled.div.attrs({
    className: 'CodeHighlight',
})`
    white-space: pre-wrap;
    height: auto;
    padding: 8px 16px;
    overflow-y: auto;
    box-shadow: none !important;
`;

export const CodeHighlight: React.FC<IProps> = ({
    className = '',
    theme = 'default',
    prefix = 'cm-',
    inline = false,

    language = 'text/x-hive',
    value,
}) => {
    const styledTokens = useMemo(() => {
        let lastStyle = null;
        let tokenBuffer = '';
        const styledTokens: Array<{ className: string; text: string }> = [];

        const pushStyleToken = (text: string, style: string) =>
            styledTokens.push({
                className: style ? prefix + style : '',
                text,
            });

        CodeMirror.runMode(value, language, (token, style) => {
            if (lastStyle === style) {
                tokenBuffer += token;
            } else {
                if (tokenBuffer.length > 0) {
                    pushStyleToken(tokenBuffer, lastStyle);
                }

                tokenBuffer = token;
                lastStyle = style;
            }
        });
        pushStyleToken(tokenBuffer, lastStyle);

        return styledTokens;
    }, [value, language, prefix]);

    const codeElements = styledTokens.map((token, index) => {
        const { text, className: tokenClassName } = token;

        return (
            <span className={tokenClassName} key={index}>
                {text}
            </span>
        );
    });

    const themeClassName = theme
        .split(' ')
        .map((subtheme) => `${prefix}s-${subtheme}`)
        .join(' ');
    const wrapperClassName = classNames({
        CodeHighlight: true,
        [themeClassName]: true,
        CodeMirror: true,
        [className]: Boolean(className),
        inline,
    });

    const wrapper = inline ? (
        <code className={wrapperClassName}>{codeElements}</code>
    ) : (
        <CodeHighlightContainer className={wrapperClassName}>
            {codeElements}
        </CodeHighlightContainer>
    );

    return wrapper;
};
