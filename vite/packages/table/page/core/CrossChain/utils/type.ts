//type of overview data in table
export interface ChainOverview {
    chain_id: number
    symbol: string  
    name: string  
    state: number
}
export interface ContractOverview {  
    contract_id: number  
    contract_addr: string  
    manager_addr: string  
    contract_state: number  
    chain_id: number  
    level_id: number  
} 
export interface TxOverview {  
    no: number; 
    tx_hash: string;  
    block_hash: string;  
    tx_index: number;  
}
export interface BlockOverview {
    block_hash: string;
    height: number;
    prev_hash: string
}