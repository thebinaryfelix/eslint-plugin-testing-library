import { ESLintUtils, TSESTree } from '@typescript-eslint/experimental-utils';
import { getDocsUrl } from '../utils';
import {
  isCallExpression,
  isIdentifier,
  isMemberExpression,
  isObjectPattern,
  isProperty,
  isRenderVariableDeclarator,
} from '../node-utils';

export const RULE_NAME = 'no-container';

export default ESLintUtils.RuleCreator(getDocsUrl)({
  name: RULE_NAME,
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow the use of container methods',
      category: 'Best Practices',
      recommended: 'error',
    },
    messages: {
      noContainer:
        'Unexpected use of container methods. Prefer the use of "screen.someMethod()".',
    },
    fixable: null,
    schema: [
      {
        type: 'object',
        properties: {
          renderFunctions: {
            type: 'array',
          },
        },
      },
    ],
  },
  defaultOptions: [
    {
      renderFunctions: [],
    },
  ],

  create(context, [options]) {
    const { renderFunctions } = options;
    let destructuredContainerName = '';

    return {
      VariableDeclarator(node) {
        if (isRenderVariableDeclarator(node, renderFunctions)) {
          if (isObjectPattern(node.id)) {
            const containerIndex = node.id.properties.findIndex(
              property =>
                isProperty(property) &&
                isIdentifier(property.key) &&
                property.key.name === 'container'
            );
            if (containerIndex !== -1) {
              const nodeValue = node.id.properties[containerIndex].value;
              destructuredContainerName =
                isIdentifier(nodeValue) && nodeValue.name;
            }
          }
        }
      },

      CallExpression(node: TSESTree.CallExpression) {
        if (
          isMemberExpression(node.callee) &&
          isIdentifier(node.callee.object) &&
          node.callee.object.name === destructuredContainerName
        ) {
          context.report({
            node,
            messageId: 'noContainer',
          });
        }
      },
    };
  },
});