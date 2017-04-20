import * as Lint from "tslint";
import * as ts from "typescript";

const UNDERSCORE = "_".charCodeAt(0);

type RelevantClassMember = ts.MethodDeclaration
                         | ts.PropertyDeclaration
                         | ts.GetAccessorDeclaration
                         | ts.SetAccessorDeclaration;

export class Rule extends Lint.Rules.AbstractRule {
    public static FAILURE_STRING = "private member's name must be prefixed with an underscore";

    public apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {
        return this.applyWithFunction(sourceFile, walk);
    }
}

function walk(ctx: Lint.WalkContext<void>): void {
    traverse(ctx.sourceFile);

    function traverse(node: ts.Node): void {
        checkNodeForViolations(ctx, node);
        return ts.forEachChild(node, traverse);
    }
}

function checkNodeForViolations(ctx: Lint.WalkContext<void>, node: ts.Node): void {
    if (!isRelevantClassMember(node)) {
        return;
    }

    // The declaration might have a computed property name or a numeric name.
    const name = node.name;
    if (!nameIsIdentifier(name)) {
        return;
    }

    if (!nameStartsWithUnderscore(name.text) && Lint.hasModifier(node.modifiers, ts.SyntaxKind.PrivateKeyword)) {
        ctx.addFailureAtNode(name, Rule.FAILURE_STRING);
    }
}

function isRelevantClassMember(node: ts.Node): node is RelevantClassMember {
    switch (node.kind) {
        case ts.SyntaxKind.MethodDeclaration:
        case ts.SyntaxKind.PropertyDeclaration:
        case ts.SyntaxKind.GetAccessor:
        case ts.SyntaxKind.SetAccessor:
            return true;
        default:
            return false;
    }
}

function nameStartsWithUnderscore(text: string) {
    return text.charCodeAt(0) === UNDERSCORE;
}

function declarationIsPrivate(text: string) {
    return text.charCodeAt(0) === UNDERSCORE;
}

function nameIsIdentifier(node: ts.Node): node is ts.Identifier {
    return node.kind === ts.SyntaxKind.Identifier;
}