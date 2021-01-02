import React, { useState } from 'react'
import { Input, Row, Col } from 'antd';
import './index.less'

interface Props {
}

abstract class Handler<T> {
  protected next: Handler<T> | null = null;
  public setNext(next: Handler<T>) {
    this.next = next;
  }
  public handleRequest(request: T): void {
    if (!this.canHandle(request)) {
      this.next?.handleRequest(request);
      return;
    }
  }
  protected abstract canHandle(request: T) : boolean;
}

class ChainHandler extends Handler<string> {
  constructor(private readonly tagType: string, private readonly handler: (content: string) => void) {
    super();
  }
  canHandle(requset: string): boolean {
    const split = requset.startsWith(this.tagType);
    if (split) {
      this.handler(requset.substr(this.tagType.length));
    }
    return split;
  }
}

class ParagraphHandler extends Handler<string> {
  constructor(private readonly handler: (content: string) => void) {
    super();
  }
  canHandle(request: string): boolean {
    this.handler(request);
    return true;
  }
}

const TagType: {
  [key:string]: (content: string) => React.ReactNode;
} = {
  '# ': (content: string) => <h1>{content}</h1>,
  '## ': (content: string) => <h2>{content}</h2>,
  '### ': (content: string) => <h3>{content}</h3>,
  '#### ': (content: string) => <h4>{content}</h4>,
  'p': (content: string) => <p>{content}</p>,
  '---': (content: string) => <hr />,
}

const Page: SFC<Props> = (props: Props): JSX.Element => {
  const [ output, setOutput ] = useState<any>('');

  // 责任链模式
  function factory(result: React.ReactNode[]) {
    const header1 = new ChainHandler('# ', (content) => {
      result.push(<h1 key={`h1 ${result.length}`}>{content}</h1>);
    });
    const header2 = new ChainHandler('## ', (content) => {
      result.push(<h2 key={`h2 ${result.length}`}>{content}</h2>);
    });
    const header3 = new ChainHandler('### ', (content) => {
      result.push(<h3 key={`h3 ${result.length}`}>{content}</h3>);
    });
    const header4 = new ChainHandler('#### ', (content) => {
      result.push(<h4 key={`h4 ${result.length}`}>{content}</h4>);
    });
    const horizontal = new ChainHandler('---', (content) => {
      result.push(<hr key={`hr ${result.length}`} />);
    });
    const paragraph = new ParagraphHandler((content) => {
      console.log(content.length)
      result.push(<p key={`p ${result.length}`}>{content.length ? content : '\n'}</p>)
    })
    header1.setNext(header2);
    header2.setNext(header3);
    header3.setNext(header4);
    header4.setNext(horizontal);
    horizontal.setNext(paragraph);
    
    return header1
  }
  function handleInputChange(ev: React.ChangeEvent<HTMLTextAreaElement>) {
    const result:React.ReactNode[] = [];
    const head = factory(result);
    const lines = ev.target.value.split('\n');
    for (let i = 0; i < lines.length; i++) {
      // head.handleRequest(lines[i]);
      result.push(parseLine(lines[i], i));
    }
    setOutput(result);
  }

  // switch模式
  function parseLine(line: string, key: number) {
    const h1 = '# ';
    const h2 = '## ';
    const h3 = '### ';
    const h4 = '#### ';
    const hr = '---';
    switch(true) {
      case line.startsWith(h1):
        return <h1 key={`h1-${key}`}>{line.substr(h1.length)}</h1>;
      case line.startsWith(h2):
        return <h2 key={`h2-${key}`}>{line.substr(h2.length)}</h2>;
      case line.startsWith(h3):
        return <h3 key={`h3-${key}`}>{line.substr(h3.length)}</h3>;
      case line.startsWith(h4):
        return <h4 key={`h4-${key}`}>{line.substr(h4.length)}</h4>;
      case line.startsWith(hr):
        return <hr key={`hr-${key}`}></hr>;
      default:
        return <p key={`p-${key}`}>{line ? line : '\n'}</p>;
    }
  }


  return (
    <div className="markdown">
      <Row className="container">
        <Col span={12}>
          <Input.TextArea onChange={handleInputChange} className="input"></Input.TextArea>
        </Col>
        <Col span={12}>
          <div className="output">
            {output}
          </div>
        </Col>
      </Row>
    </div>
  )
}

export default Page
