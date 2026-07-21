// package: christiangeorgelucas.css_tools
// file: messages.proto

import * as jspb from "google-protobuf";

export class Stylesheet extends jspb.Message {
  getCss(): string;
  setCss(value: string): void;

  getError(): string;
  setError(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Stylesheet.AsObject;
  static toObject(includeInstance: boolean, msg: Stylesheet): Stylesheet.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: Stylesheet, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Stylesheet;
  static deserializeBinaryFromReader(message: Stylesheet, reader: jspb.BinaryReader): Stylesheet;
}

export namespace Stylesheet {
  export type AsObject = {
    css: string,
    error: string,
  }
}

export class CssSyntaxError extends jspb.Message {
  getMessage(): string;
  setMessage(value: string): void;

  getLine(): number;
  setLine(value: number): void;

  getColumn(): number;
  setColumn(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): CssSyntaxError.AsObject;
  static toObject(includeInstance: boolean, msg: CssSyntaxError): CssSyntaxError.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: CssSyntaxError, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): CssSyntaxError;
  static deserializeBinaryFromReader(message: CssSyntaxError, reader: jspb.BinaryReader): CssSyntaxError;
}

export namespace CssSyntaxError {
  export type AsObject = {
    message: string,
    line: number,
    column: number,
  }
}

export class ParseResult extends jspb.Message {
  getAstJson(): string;
  setAstJson(value: string): void;

  clearSyntaxErrorsList(): void;
  getSyntaxErrorsList(): Array<CssSyntaxError>;
  setSyntaxErrorsList(value: Array<CssSyntaxError>): void;
  addSyntaxErrors(value?: CssSyntaxError, index?: number): CssSyntaxError;

  getError(): string;
  setError(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ParseResult.AsObject;
  static toObject(includeInstance: boolean, msg: ParseResult): ParseResult.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ParseResult, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ParseResult;
  static deserializeBinaryFromReader(message: ParseResult, reader: jspb.BinaryReader): ParseResult;
}

export namespace ParseResult {
  export type AsObject = {
    astJson: string,
    syntaxErrorsList: Array<CssSyntaxError.AsObject>,
    error: string,
  }
}

export class AstInput extends jspb.Message {
  getAstJson(): string;
  setAstJson(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): AstInput.AsObject;
  static toObject(includeInstance: boolean, msg: AstInput): AstInput.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: AstInput, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): AstInput;
  static deserializeBinaryFromReader(message: AstInput, reader: jspb.BinaryReader): AstInput;
}

export namespace AstInput {
  export type AsObject = {
    astJson: string,
  }
}

export class PrettifyRequest extends jspb.Message {
  getCss(): string;
  setCss(value: string): void;

  getIndent(): number;
  setIndent(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): PrettifyRequest.AsObject;
  static toObject(includeInstance: boolean, msg: PrettifyRequest): PrettifyRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: PrettifyRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): PrettifyRequest;
  static deserializeBinaryFromReader(message: PrettifyRequest, reader: jspb.BinaryReader): PrettifyRequest;
}

export namespace PrettifyRequest {
  export type AsObject = {
    css: string,
    indent: number,
  }
}

export class ValidateResult extends jspb.Message {
  getValid(): boolean;
  setValid(value: boolean): void;

  clearSyntaxErrorsList(): void;
  getSyntaxErrorsList(): Array<CssSyntaxError>;
  setSyntaxErrorsList(value: Array<CssSyntaxError>): void;
  addSyntaxErrors(value?: CssSyntaxError, index?: number): CssSyntaxError;

  clearStructuralErrorsList(): void;
  getStructuralErrorsList(): Array<string>;
  setStructuralErrorsList(value: Array<string>): void;
  addStructuralErrors(value: string, index?: number): string;

  getError(): string;
  setError(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ValidateResult.AsObject;
  static toObject(includeInstance: boolean, msg: ValidateResult): ValidateResult.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ValidateResult, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ValidateResult;
  static deserializeBinaryFromReader(message: ValidateResult, reader: jspb.BinaryReader): ValidateResult;
}

export namespace ValidateResult {
  export type AsObject = {
    valid: boolean,
    syntaxErrorsList: Array<CssSyntaxError.AsObject>,
    structuralErrorsList: Array<string>,
    error: string,
  }
}

export class SelectorEntry extends jspb.Message {
  getSelector(): string;
  setSelector(value: string): void;

  getRuleIndex(): number;
  setRuleIndex(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): SelectorEntry.AsObject;
  static toObject(includeInstance: boolean, msg: SelectorEntry): SelectorEntry.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: SelectorEntry, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): SelectorEntry;
  static deserializeBinaryFromReader(message: SelectorEntry, reader: jspb.BinaryReader): SelectorEntry;
}

export namespace SelectorEntry {
  export type AsObject = {
    selector: string,
    ruleIndex: number,
  }
}

export class SelectorList extends jspb.Message {
  clearSelectorsList(): void;
  getSelectorsList(): Array<SelectorEntry>;
  setSelectorsList(value: Array<SelectorEntry>): void;
  addSelectors(value?: SelectorEntry, index?: number): SelectorEntry;

  getError(): string;
  setError(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): SelectorList.AsObject;
  static toObject(includeInstance: boolean, msg: SelectorList): SelectorList.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: SelectorList, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): SelectorList;
  static deserializeBinaryFromReader(message: SelectorList, reader: jspb.BinaryReader): SelectorList;
}

export namespace SelectorList {
  export type AsObject = {
    selectorsList: Array<SelectorEntry.AsObject>,
    error: string,
  }
}

export class DeclarationEntry extends jspb.Message {
  getProperty(): string;
  setProperty(value: string): void;

  getValue(): string;
  setValue(value: string): void;

  getImportant(): boolean;
  setImportant(value: boolean): void;

  getRuleIndex(): number;
  setRuleIndex(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): DeclarationEntry.AsObject;
  static toObject(includeInstance: boolean, msg: DeclarationEntry): DeclarationEntry.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: DeclarationEntry, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): DeclarationEntry;
  static deserializeBinaryFromReader(message: DeclarationEntry, reader: jspb.BinaryReader): DeclarationEntry;
}

export namespace DeclarationEntry {
  export type AsObject = {
    property: string,
    value: string,
    important: boolean,
    ruleIndex: number,
  }
}

export class DeclarationList extends jspb.Message {
  clearDeclarationsList(): void;
  getDeclarationsList(): Array<DeclarationEntry>;
  setDeclarationsList(value: Array<DeclarationEntry>): void;
  addDeclarations(value?: DeclarationEntry, index?: number): DeclarationEntry;

  getError(): string;
  setError(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): DeclarationList.AsObject;
  static toObject(includeInstance: boolean, msg: DeclarationList): DeclarationList.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: DeclarationList, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): DeclarationList;
  static deserializeBinaryFromReader(message: DeclarationList, reader: jspb.BinaryReader): DeclarationList;
}

export namespace DeclarationList {
  export type AsObject = {
    declarationsList: Array<DeclarationEntry.AsObject>,
    error: string,
  }
}

export class RuleEntry extends jspb.Message {
  getIndex(): number;
  setIndex(value: number): void;

  getSelector(): string;
  setSelector(value: string): void;

  clearDeclarationsList(): void;
  getDeclarationsList(): Array<DeclarationEntry>;
  setDeclarationsList(value: Array<DeclarationEntry>): void;
  addDeclarations(value?: DeclarationEntry, index?: number): DeclarationEntry;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): RuleEntry.AsObject;
  static toObject(includeInstance: boolean, msg: RuleEntry): RuleEntry.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: RuleEntry, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): RuleEntry;
  static deserializeBinaryFromReader(message: RuleEntry, reader: jspb.BinaryReader): RuleEntry;
}

export namespace RuleEntry {
  export type AsObject = {
    index: number,
    selector: string,
    declarationsList: Array<DeclarationEntry.AsObject>,
  }
}

export class RuleList extends jspb.Message {
  clearRulesList(): void;
  getRulesList(): Array<RuleEntry>;
  setRulesList(value: Array<RuleEntry>): void;
  addRules(value?: RuleEntry, index?: number): RuleEntry;

  getError(): string;
  setError(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): RuleList.AsObject;
  static toObject(includeInstance: boolean, msg: RuleList): RuleList.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: RuleList, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): RuleList;
  static deserializeBinaryFromReader(message: RuleList, reader: jspb.BinaryReader): RuleList;
}

export namespace RuleList {
  export type AsObject = {
    rulesList: Array<RuleEntry.AsObject>,
    error: string,
  }
}

export class AtRuleEntry extends jspb.Message {
  getIndex(): number;
  setIndex(value: number): void;

  getName(): string;
  setName(value: string): void;

  getPrelude(): string;
  setPrelude(value: string): void;

  getBodyCss(): string;
  setBodyCss(value: string): void;

  clearDeclarationsList(): void;
  getDeclarationsList(): Array<DeclarationEntry>;
  setDeclarationsList(value: Array<DeclarationEntry>): void;
  addDeclarations(value?: DeclarationEntry, index?: number): DeclarationEntry;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): AtRuleEntry.AsObject;
  static toObject(includeInstance: boolean, msg: AtRuleEntry): AtRuleEntry.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: AtRuleEntry, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): AtRuleEntry;
  static deserializeBinaryFromReader(message: AtRuleEntry, reader: jspb.BinaryReader): AtRuleEntry;
}

export namespace AtRuleEntry {
  export type AsObject = {
    index: number,
    name: string,
    prelude: string,
    bodyCss: string,
    declarationsList: Array<DeclarationEntry.AsObject>,
  }
}

export class AtRuleList extends jspb.Message {
  clearAtRulesList(): void;
  getAtRulesList(): Array<AtRuleEntry>;
  setAtRulesList(value: Array<AtRuleEntry>): void;
  addAtRules(value?: AtRuleEntry, index?: number): AtRuleEntry;

  getError(): string;
  setError(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): AtRuleList.AsObject;
  static toObject(includeInstance: boolean, msg: AtRuleList): AtRuleList.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: AtRuleList, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): AtRuleList;
  static deserializeBinaryFromReader(message: AtRuleList, reader: jspb.BinaryReader): AtRuleList;
}

export namespace AtRuleList {
  export type AsObject = {
    atRulesList: Array<AtRuleEntry.AsObject>,
    error: string,
  }
}

export class ColorEntry extends jspb.Message {
  getValue(): string;
  setValue(value: string): void;

  getFormat(): string;
  setFormat(value: string): void;

  getProperty(): string;
  setProperty(value: string): void;

  getRuleIndex(): number;
  setRuleIndex(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ColorEntry.AsObject;
  static toObject(includeInstance: boolean, msg: ColorEntry): ColorEntry.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ColorEntry, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ColorEntry;
  static deserializeBinaryFromReader(message: ColorEntry, reader: jspb.BinaryReader): ColorEntry;
}

export namespace ColorEntry {
  export type AsObject = {
    value: string,
    format: string,
    property: string,
    ruleIndex: number,
  }
}

export class ColorList extends jspb.Message {
  clearColorsList(): void;
  getColorsList(): Array<ColorEntry>;
  setColorsList(value: Array<ColorEntry>): void;
  addColors(value?: ColorEntry, index?: number): ColorEntry;

  getError(): string;
  setError(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ColorList.AsObject;
  static toObject(includeInstance: boolean, msg: ColorList): ColorList.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ColorList, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ColorList;
  static deserializeBinaryFromReader(message: ColorList, reader: jspb.BinaryReader): ColorList;
}

export namespace ColorList {
  export type AsObject = {
    colorsList: Array<ColorEntry.AsObject>,
    error: string,
  }
}

export class CustomPropertyEntry extends jspb.Message {
  getName(): string;
  setName(value: string): void;

  getDeclared(): boolean;
  setDeclared(value: boolean): void;

  getReferenced(): boolean;
  setReferenced(value: boolean): void;

  getLastDeclaredValue(): string;
  setLastDeclaredValue(value: string): void;

  getDeclarationCount(): number;
  setDeclarationCount(value: number): void;

  getReferenceCount(): number;
  setReferenceCount(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): CustomPropertyEntry.AsObject;
  static toObject(includeInstance: boolean, msg: CustomPropertyEntry): CustomPropertyEntry.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: CustomPropertyEntry, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): CustomPropertyEntry;
  static deserializeBinaryFromReader(message: CustomPropertyEntry, reader: jspb.BinaryReader): CustomPropertyEntry;
}

export namespace CustomPropertyEntry {
  export type AsObject = {
    name: string,
    declared: boolean,
    referenced: boolean,
    lastDeclaredValue: string,
    declarationCount: number,
    referenceCount: number,
  }
}

export class CustomPropertyList extends jspb.Message {
  clearPropertiesList(): void;
  getPropertiesList(): Array<CustomPropertyEntry>;
  setPropertiesList(value: Array<CustomPropertyEntry>): void;
  addProperties(value?: CustomPropertyEntry, index?: number): CustomPropertyEntry;

  getError(): string;
  setError(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): CustomPropertyList.AsObject;
  static toObject(includeInstance: boolean, msg: CustomPropertyList): CustomPropertyList.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: CustomPropertyList, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): CustomPropertyList;
  static deserializeBinaryFromReader(message: CustomPropertyList, reader: jspb.BinaryReader): CustomPropertyList;
}

export namespace CustomPropertyList {
  export type AsObject = {
    propertiesList: Array<CustomPropertyEntry.AsObject>,
    error: string,
  }
}

export class FontFamilyList extends jspb.Message {
  clearFamiliesList(): void;
  getFamiliesList(): Array<string>;
  setFamiliesList(value: Array<string>): void;
  addFamilies(value: string, index?: number): string;

  getError(): string;
  setError(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): FontFamilyList.AsObject;
  static toObject(includeInstance: boolean, msg: FontFamilyList): FontFamilyList.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: FontFamilyList, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): FontFamilyList;
  static deserializeBinaryFromReader(message: FontFamilyList, reader: jspb.BinaryReader): FontFamilyList;
}

export namespace FontFamilyList {
  export type AsObject = {
    familiesList: Array<string>,
    error: string,
  }
}

export class UrlEntry extends jspb.Message {
  getUrl(): string;
  setUrl(value: string): void;

  getContext(): string;
  setContext(value: string): void;

  getRuleIndex(): number;
  setRuleIndex(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): UrlEntry.AsObject;
  static toObject(includeInstance: boolean, msg: UrlEntry): UrlEntry.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: UrlEntry, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): UrlEntry;
  static deserializeBinaryFromReader(message: UrlEntry, reader: jspb.BinaryReader): UrlEntry;
}

export namespace UrlEntry {
  export type AsObject = {
    url: string,
    context: string,
    ruleIndex: number,
  }
}

export class UrlList extends jspb.Message {
  clearUrlsList(): void;
  getUrlsList(): Array<UrlEntry>;
  setUrlsList(value: Array<UrlEntry>): void;
  addUrls(value?: UrlEntry, index?: number): UrlEntry;

  getError(): string;
  setError(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): UrlList.AsObject;
  static toObject(includeInstance: boolean, msg: UrlList): UrlList.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: UrlList, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): UrlList;
  static deserializeBinaryFromReader(message: UrlList, reader: jspb.BinaryReader): UrlList;
}

export namespace UrlList {
  export type AsObject = {
    urlsList: Array<UrlEntry.AsObject>,
    error: string,
  }
}

export class SelectorInput extends jspb.Message {
  getSelector(): string;
  setSelector(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): SelectorInput.AsObject;
  static toObject(includeInstance: boolean, msg: SelectorInput): SelectorInput.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: SelectorInput, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): SelectorInput;
  static deserializeBinaryFromReader(message: SelectorInput, reader: jspb.BinaryReader): SelectorInput;
}

export namespace SelectorInput {
  export type AsObject = {
    selector: string,
  }
}

export class SelectorComponent extends jspb.Message {
  getKind(): string;
  setKind(value: string): void;

  getText(): string;
  setText(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): SelectorComponent.AsObject;
  static toObject(includeInstance: boolean, msg: SelectorComponent): SelectorComponent.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: SelectorComponent, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): SelectorComponent;
  static deserializeBinaryFromReader(message: SelectorComponent, reader: jspb.BinaryReader): SelectorComponent;
}

export namespace SelectorComponent {
  export type AsObject = {
    kind: string,
    text: string,
  }
}

export class Specificity extends jspb.Message {
  getA(): number;
  setA(value: number): void;

  getB(): number;
  setB(value: number): void;

  getC(): number;
  setC(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Specificity.AsObject;
  static toObject(includeInstance: boolean, msg: Specificity): Specificity.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: Specificity, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Specificity;
  static deserializeBinaryFromReader(message: Specificity, reader: jspb.BinaryReader): Specificity;
}

export namespace Specificity {
  export type AsObject = {
    a: number,
    b: number,
    c: number,
  }
}

export class ParsedSelector extends jspb.Message {
  getText(): string;
  setText(value: string): void;

  clearComponentsList(): void;
  getComponentsList(): Array<SelectorComponent>;
  setComponentsList(value: Array<SelectorComponent>): void;
  addComponents(value?: SelectorComponent, index?: number): SelectorComponent;

  hasSpecificity(): boolean;
  clearSpecificity(): void;
  getSpecificity(): Specificity | undefined;
  setSpecificity(value?: Specificity): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ParsedSelector.AsObject;
  static toObject(includeInstance: boolean, msg: ParsedSelector): ParsedSelector.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ParsedSelector, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ParsedSelector;
  static deserializeBinaryFromReader(message: ParsedSelector, reader: jspb.BinaryReader): ParsedSelector;
}

export namespace ParsedSelector {
  export type AsObject = {
    text: string,
    componentsList: Array<SelectorComponent.AsObject>,
    specificity?: Specificity.AsObject,
  }
}

export class SelectorResult extends jspb.Message {
  clearSelectorsList(): void;
  getSelectorsList(): Array<ParsedSelector>;
  setSelectorsList(value: Array<ParsedSelector>): void;
  addSelectors(value?: ParsedSelector, index?: number): ParsedSelector;

  getError(): string;
  setError(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): SelectorResult.AsObject;
  static toObject(includeInstance: boolean, msg: SelectorResult): SelectorResult.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: SelectorResult, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): SelectorResult;
  static deserializeBinaryFromReader(message: SelectorResult, reader: jspb.BinaryReader): SelectorResult;
}

export namespace SelectorResult {
  export type AsObject = {
    selectorsList: Array<ParsedSelector.AsObject>,
    error: string,
  }
}

export class ValueInput extends jspb.Message {
  getValue(): string;
  setValue(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ValueInput.AsObject;
  static toObject(includeInstance: boolean, msg: ValueInput): ValueInput.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ValueInput, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ValueInput;
  static deserializeBinaryFromReader(message: ValueInput, reader: jspb.BinaryReader): ValueInput;
}

export namespace ValueInput {
  export type AsObject = {
    value: string,
  }
}

export class ValueToken extends jspb.Message {
  getType(): string;
  setType(value: string): void;

  getText(): string;
  setText(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ValueToken.AsObject;
  static toObject(includeInstance: boolean, msg: ValueToken): ValueToken.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ValueToken, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ValueToken;
  static deserializeBinaryFromReader(message: ValueToken, reader: jspb.BinaryReader): ValueToken;
}

export namespace ValueToken {
  export type AsObject = {
    type: string,
    text: string,
  }
}

export class ValueResult extends jspb.Message {
  clearTokensList(): void;
  getTokensList(): Array<ValueToken>;
  setTokensList(value: Array<ValueToken>): void;
  addTokens(value?: ValueToken, index?: number): ValueToken;

  getError(): string;
  setError(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ValueResult.AsObject;
  static toObject(includeInstance: boolean, msg: ValueResult): ValueResult.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ValueResult, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ValueResult;
  static deserializeBinaryFromReader(message: ValueResult, reader: jspb.BinaryReader): ValueResult;
}

export namespace ValueResult {
  export type AsObject = {
    tokensList: Array<ValueToken.AsObject>,
    error: string,
  }
}

