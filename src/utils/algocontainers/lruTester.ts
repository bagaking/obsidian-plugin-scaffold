import {LOG} from "../log";
const logger = LOG("bk.lru_tester");

export class LRUTester {
  size: number;
  data: string[];

  constructor(size: number) {
    this.size = size;
    this.data = [];
  }

  public remove(str: string) {
    this.data.remove(str)
  }

  public clear(): LRUTester {
    this.data = []
    return this
  }

  public contains(str: string, replace?: string): boolean {
    let i = this.data.findIndex(s => s == str);
    if(i < 0) {
      return false
    }

    const last = this.data.length - 1
    for(; i < last; i++){
      this.data[i] = this.data[i+1]
    }
    this.data[last] = replace || str;
    return true
  }

  public push(str: string) { // 重复不管
    if(this.data.length < this.size) {
      this.data.push(str)
      return
    }
    this.contains(this.data[0], str)
  }
}
