// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;
import "hardhat/console.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Maze is Ownable{
    uint256 _counter;

    enum Player{Player1,Player2}

    enum MoveResult{Near,Far,Exact,Same}

    enum GameStatus{Init, Start, End}

    enum BidType{Free, Half,Full}

    struct SecretMetadata{
        Point p;
    }

    struct Point{
        uint8 x;
        uint8 y;
    }

    struct MoveMetadata{
        bool is_valid;
        Point from;
        Point to;
        uint256 timestamp;
        MoveResult move_result;
    }

    struct PublicMetadata{
        address creator;
        address player2;
        address winner;
        Point current_pos;
        uint64 move_time;
        uint8 move_counter;
        uint8 current_move_counter;
        uint256 last_move_timestamp;
        uint256 game_index;
        GameStatus status; 
        BidType bid_type;
        mapping(uint => MoveMetadata) move_map;
    }

    struct DepositMetadata{
        uint creator_deposit;
        uint player2_deposit;
    }

    uint fees;

    mapping (uint=>SecretMetadata) private _secretLocations;
    mapping(uint => PublicMetadata) public  _gameMetadatas;
    mapping (uint => DepositMetadata) public _deposits;
    uint fee=200;

    event SecretPositionCreated(
        address indexed creator,
        uint256 index
    );

    event SecretPositionRevealed(
        address indexed creator,
        Point pos,
        uint256 index
    );

    event GameInitialize(
        address indexed creator,
        Point pos,
        uint256 game_index,
        uint64 move_time,
        uint8 move_counter
    );

    event GameJoin(
        address indexed creator,
        address indexed player2,
        uint256 index
    );

    event PlayerMove(
        address indexed creator,
        address indexed player2,
        uint256 index,
        Point pos,
        MoveResult move_result
    );

    event PlayerMoveEnd(
        address indexed creator,
        address indexed player2,
        uint256 index,
        address winner,
        uint amount
    );

    error MismatchedBid(uint user_bid,uint required_bid);
    error EndGameNotAllowed(uint game_index);

    function initGame(Point calldata p1_pos,
    Point calldata p2_pos,
    uint8 move_counter,
    uint64 move_time_limit, BidType bid_type ) external payable{
        _gameMetadatas[_counter].creator=msg.sender;
        _gameMetadatas[_counter].player2=address(0);
        _gameMetadatas[_counter].current_pos=p2_pos;
        _gameMetadatas[_counter].move_time=move_time_limit;
        _gameMetadatas[_counter].move_counter=move_counter;
        _gameMetadatas[_counter].current_move_counter=0;
        _gameMetadatas[_counter].status=GameStatus.Init;
        _gameMetadatas[_counter].last_move_timestamp=block.timestamp;
        _gameMetadatas[_counter].winner=address(0);
        _gameMetadatas[_counter].bid_type=bid_type;
        _gameMetadatas[_counter].game_index=_counter;
        
        _deposits[_counter]=DepositMetadata({creator_deposit: msg.value, player2_deposit: 0});

        MoveMetadata memory moveData;
        moveData.is_valid=false;
        moveData.from=Point({x:0,y:0});
        moveData.to=Point({x:0,y:0});
        moveData.timestamp=0;
        moveData.move_result=MoveResult.Same;
        _gameMetadatas[_counter].move_map[0]=moveData;

        _secretLocations[_counter]=SecretMetadata({p: p1_pos});

        emit SecretPositionCreated(msg.sender,_counter);
        emit GameInitialize(msg.sender, p2_pos, _counter,move_time_limit, move_counter);

        _counter+=1;
        
    }

    function joinGame(uint256 game_index) external payable  {
        require(game_index<_counter, "No game index present");
        require(_gameMetadatas[game_index].status==GameStatus.Init, "Game has already started");
        require(_gameMetadatas[game_index].creator != msg.sender, "Game creator and joiner cannot be same");

        _gameMetadatas[game_index].status=GameStatus.Start;
        _gameMetadatas[game_index].player2=msg.sender;
        _gameMetadatas[game_index].last_move_timestamp=block.timestamp;
        uint creator_deposit=_deposits[game_index].creator_deposit;
        uint required_bid=_gameMetadatas[game_index].bid_type == BidType.Free ? 0 : 
            _gameMetadatas[game_index].bid_type==BidType.Half ? uint(creator_deposit/2) : creator_deposit;
        require(msg.value==required_bid,"Users bid does not match required bid value");
        _deposits[game_index].player2_deposit=msg.value;
        //_gameMetadatas[game_index].move_map[0].timestamp=block.timestamp;
        //emit Join Event
        emit GameJoin(_gameMetadatas[game_index].creator,msg.sender,game_index);
    }

    function playerMove(uint256 game_index, Point calldata pos) external {
        require(game_index<_counter, "No game index present");
        require(_gameMetadatas[game_index].status==GameStatus.Start, "Game is not in start state");
        require(_gameMetadatas[game_index].current_move_counter<_gameMetadatas[game_index].move_counter,
         "Move count is already finished");

        uint8 c=_gameMetadatas[game_index].current_move_counter;
        uint256 time_limit=_gameMetadatas[game_index].last_move_timestamp+ _gameMetadatas[game_index].move_time;
        console.log("time_limit",time_limit,"block.timestamp ",block.timestamp );
        if(block.timestamp > time_limit)
        {
            //game end
            _processEndGame(game_index,_gameMetadatas[game_index].creator);
            return;
        }

        _gameMetadatas[game_index].move_map[c].is_valid=true;
        _gameMetadatas[game_index].move_map[c].from=_gameMetadatas[game_index].current_pos;
        _gameMetadatas[game_index].move_map[c].to=pos;
        _gameMetadatas[game_index].move_map[c].timestamp=block.timestamp;
        _gameMetadatas[game_index].last_move_timestamp=block.timestamp;

        _gameMetadatas[game_index].move_map[c].move_result=getMoveResult(_secretLocations[game_index].p,
            _gameMetadatas[game_index].current_pos,pos);
        _gameMetadatas[game_index].current_pos=pos;

        //emit player move
        emit PlayerMove(_gameMetadatas[game_index].creator,_gameMetadatas[game_index].player2,
            game_index,pos,_gameMetadatas[game_index].move_map[c].move_result);
        
        // if(_gameMetadatas[game_index].move_map[c].move_result==MoveResult.Exact){
        //     //game end
        //     _processEndGame(game_index,_gameMetadatas[game_index].player2);
        //     return ;
        // }
        _gameMetadatas[game_index].current_move_counter+=1;
        //emit player move event
        // if(_gameMetadatas[game_index].current_move_counter>=_gameMetadatas[game_index].move_counter){
        //     _processEndGame(game_index,_gameMetadatas[game_index].creator);
        // }
    }

    function endGame(uint256 game_index) external {
        require(game_index<_counter, "No game index present");
        require(_gameMetadatas[game_index].status==GameStatus.Start, "Game is not in start state");
        //First check if player2 is winner
        uint8 current_moves=_gameMetadatas[game_index].current_move_counter;
        uint8 allowed_moves=_gameMetadatas[game_index].move_counter;
        
        if(_gameMetadatas[game_index].move_map[current_moves-1].move_result==MoveResult.Exact){
            _processEndGame(game_index,_gameMetadatas[game_index].player2);
            return ;
        }
        if(current_moves>allowed_moves){
            _processEndGame(game_index,_gameMetadatas[game_index].creator);
            return ;
        }
        uint256 time_limit=_gameMetadatas[game_index].last_move_timestamp+ _gameMetadatas[game_index].move_time;
        //moves finished or time elasped, end for 
        if(block.timestamp > time_limit){
            _processEndGame(game_index,_gameMetadatas[game_index].creator);
        }
        revert EndGameNotAllowed(game_index);
        //Throw error game cannot be ended
        //require(block.timestamp > time_limit, "Game cannot be ended");
        
    }

    function forfeitGame(uint256 game_index) external {
        require(game_index<_counter, "No game index present");
        require(msg.sender==_gameMetadatas[game_index].creator || msg.sender==_gameMetadatas[game_index].player2, "This wallet is not part of this game");
        if(msg.sender==_gameMetadatas[game_index].creator){
            if(_gameMetadatas[game_index].player2==address(0))
                _processEndGame(game_index,_gameMetadatas[game_index].creator);
            else 
                _processEndGame(game_index,_gameMetadatas[game_index].player2);
        }else{
            _processEndGame(game_index,_gameMetadatas[game_index].creator);
        }
    }


    function _processEndGame(uint256 game_index,address winner) private {
        _gameMetadatas[game_index].status=GameStatus.End;    
        _gameMetadatas[game_index].winner=winner;
        uint amount=0;
        if(_gameMetadatas[game_index].bid_type==BidType.Half)
            amount=(_deposits[game_index].creator_deposit+_deposits[game_index].player2_deposit)*(100_00-fee)/100_00;
        fees=fees+(_deposits[game_index].creator_deposit+_deposits[game_index].player2_deposit)*(fee)/100_00;
        require(amount<=_deposits[game_index].creator_deposit+_deposits[game_index].player2_deposit,"Amount greater than deposit");
        if(amount>0){
            (bool success,)=winner.call{value:amount}("");
            require(success,"Payment failed");
        }
        emit PlayerMoveEnd(_gameMetadatas[game_index].creator,_gameMetadatas[game_index].player2,game_index,
        _gameMetadatas[game_index].winner,amount);
    }

    
    function withdraw() public onlyOwner {
        uint256 amount = fees;
        require(amount > 0, "Nothing to withdraw; contract balance empty");
        fees=0;
        address _owner = owner();
        (bool sent, ) = _owner.call{value: amount}("");
        require(sent, "Failed to send Ether");
    }


    function getMoveResult(Point memory ref_point, Point memory old_point,Point calldata new_point) public pure 
    returns (MoveResult){
        uint old_distance=getPointDistance(ref_point,old_point);
        uint new_distance=getPointDistance(ref_point,new_point);
        if(new_distance==0)
            return MoveResult.Exact;
        if(new_distance==old_distance)
            return MoveResult.Same;
        if(new_distance<old_distance)
            return MoveResult.Near;
        return  MoveResult.Far;
    }

    function getPointDistance(Point memory p1, Point memory p2) public pure returns (uint)
    {
        uint8 x=(p1.x>p2.x ? p1.x-p2.x : p2.x-p1.x);
        uint8 y=(p1.y>p2.y ? p1.y-p2.y: p2.y-p1.y);
        return (x)*(x) + (y)*(y);
    }

    function getMoveData(uint256 game_index, uint8 move_index) public view returns(MoveMetadata memory){
        return _gameMetadatas[game_index].move_map[move_index];
    }

    function getSecretPosition(uint256 game_index,string calldata data, bytes calldata signature) external view returns (Point memory){
        require(game_index<_counter, "no such secret");
        PublicMetadata storage metadata=_gameMetadatas[game_index];
        require(metadata.status==GameStatus.End || verifySignature(metadata.creator,game_index,data,signature),"Not allowed");
        return _secretLocations[game_index].p;   
    }

    function getCurrentBalance() public view returns(uint){        return address(this).balance;
    }

    function verifySignature(address signer,uint256 game_index, string calldata data, bytes calldata signature) public pure returns(bool){
        string memory data_hash=_getMessageHash(game_index,data);
        bytes32 signature_hash=getEthHash(data_hash,"66");
        //require(data_hash==hash,"Hash does not match");
        (bytes32 _r, bytes32 _s, uint8 _v) = splitSignature(signature);
        address signature_signer = ecrecover(signature_hash, _v, _r, _s);
        
        return signature_signer==signer;
    }

    function _getMessageHash(uint256 game_index, string calldata data) public pure returns(string memory){
        return _toLower(toHex(keccak256(abi.encodePacked(data,game_index))));
    }

    function _getSignatureAddress(bytes32 hash, bytes calldata signature) public pure returns(address) {
        (bytes32 _r, bytes32 _s, uint8 _v) = splitSignature(signature);
        address signature_signer = ecrecover(hash, _v, _r, _s);
        return signature_signer;
    }
    
    function splitSignature(
        bytes memory sig
    ) internal pure returns (bytes32 r, bytes32 s, uint8 v) {
        require(sig.length == 65, "invalid signature length");

        assembly {
           
            // first 32 bytes, after the length prefix
            r := mload(add(sig, 32))
            // second 32 bytes
            s := mload(add(sig, 64))
            // final byte (first byte of the next 32 bytes)
            v := byte(0, mload(add(sig, 96)))
        }

        // implicitly return (r, s, v)
    }

    function getEthHash(string memory message, string memory length) public pure returns (bytes32){
        bytes memory prefix = "\x19Ethereum Signed Message:\n";
        bytes32 prefixedHashMessage = keccak256(abi.encodePacked(prefix,length, message));
        return prefixedHashMessage;
    }
 
    function stringToBytes32(string memory source) internal pure returns (bytes32 result) {
        bytes memory tempEmptyStringTest = bytes(source);
        if (tempEmptyStringTest.length == 0) {
            return 0x0;
        }

        assembly {
            result := mload(add(source, 32))
        }
    }

    function toHex16 (bytes16 data) internal pure returns (bytes32 result) {
    result = bytes32 (data) & 0xFFFFFFFFFFFFFFFF000000000000000000000000000000000000000000000000 |
          (bytes32 (data) & 0x0000000000000000FFFFFFFFFFFFFFFF00000000000000000000000000000000) >> 64;
    result = result & 0xFFFFFFFF000000000000000000000000FFFFFFFF000000000000000000000000 |
          (result & 0x00000000FFFFFFFF000000000000000000000000FFFFFFFF0000000000000000) >> 32;
    result = result & 0xFFFF000000000000FFFF000000000000FFFF000000000000FFFF000000000000 |
          (result & 0x0000FFFF000000000000FFFF000000000000FFFF000000000000FFFF00000000) >> 16;
    result = result & 0xFF000000FF000000FF000000FF000000FF000000FF000000FF000000FF000000 |
          (result & 0x00FF000000FF000000FF000000FF000000FF000000FF000000FF000000FF0000) >> 8;
    result = (result & 0xF000F000F000F000F000F000F000F000F000F000F000F000F000F000F000F000) >> 4 |
          (result & 0x0F000F000F000F000F000F000F000F000F000F000F000F000F000F000F000F00) >> 8;
    result = bytes32 (0x3030303030303030303030303030303030303030303030303030303030303030 +
           uint256 (result) +
           (uint256 (result) + 0x0606060606060606060606060606060606060606060606060606060606060606 >> 4 &
           0x0F0F0F0F0F0F0F0F0F0F0F0F0F0F0F0F0F0F0F0F0F0F0F0F0F0F0F0F0F0F0F0F) * 7);
}

function toHex (bytes32 data) internal pure returns (string memory) {
    return string (abi.encodePacked ("0x", toHex16 (bytes16 (data)), toHex16 (bytes16 (data << 128))));
}
function _toLower(string memory str) internal pure returns (string memory) {
        bytes memory bStr = bytes(str);
        bytes memory bLower = new bytes(bStr.length);
        for (uint i = 0; i < bStr.length; i++) {
            // Uppercase character...
            if ((uint8(bStr[i]) >= 65) && (uint8(bStr[i]) <= 90)) {
                // So we add 32 to make it lowercase
                bLower[i] = bytes1(uint8(bStr[i]) + 32);
            } else {
                bLower[i] = bStr[i];
            }
        }
        return string(bLower);
    }
}