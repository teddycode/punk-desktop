import Mock from 'mockjs'
import '@/mock/extend'
import * as fs from "fs";
import {API_PREFIX} from "../../utils/request";

//  查询所有区块
Mock.mock(`${API_PREFIX}/consensus/block/list`, 'get', () => {
  try {
    return fs.readFileSync("./data/block.json", 'utf-8');
  } catch (error) {
    console.error(`Failed to read file: ${error.message}`);
    return null;
  }
})

// 通过区块高度查看区块信息
Mock.mock('/consensus/block/byHeight', 'get', () => {
  try {
    return fs.readFileSync("./data/block.json", 'utf-8');
  } catch (error) {
    console.error(`Failed to read file: ${error.message}`);
    return null;
  }
})

// 通过哈希查询区块信息
Mock.mock('/consensus/block/byHash', 'get', () => {
  try {
    return fs.readFileSync("./data/block.json", 'utf-8');
  } catch (error) {
    console.error(`Failed to read file: ${error.message}`);
    return null;
  }
})

// 查询我的区块
Mock.mock('/consensus/block/mine', 'get', (id) => {
  try {
    return fs.readFileSync("./data/myBlock.json", 'utf-8');
  } catch (error) {
    console.error(`Failed to read file: ${error.message}`);
    return null;
  }
})


// 查询我的区块
Mock.mock('/consensus/block/mic/mine', 'get', (id) => {
  try {
    return fs.readFileSync("./data/micBlock.json", 'utf-8');
  } catch (error) {
    console.error(`Failed to read file: ${error.message}`);
    return null;
  }
})


// 通过height查询Mic区块
Mock.mock('/consensus/block/mick/byHeight', 'get', (id) => {
  try {
    return fs.readFileSync("./data/micBlock.json", 'utf-8');
  } catch (error) {
    console.error(`Failed to read file: ${error.message}`);
    return null;
  }
})

// 通过hash查询Mic区块
Mock.mock('/consensus/block/mick/byHash', 'get', (id) => {
  try {
    return fs.readFileSync("./data/micBlock.json", 'utf-8');
  } catch (error) {
    console.error(`Failed to read file: ${error.message}`);
    return null;
  }
})
