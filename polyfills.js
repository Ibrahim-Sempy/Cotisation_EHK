import 'react-native-url-polyfill/auto';
import 'buffer';
import { Buffer } from 'buffer';
import process from 'process';
import crypto from 'react-native-crypto';
import WebSocket from 'react-native-websocket';
import pako from 'pako';

global.Buffer = Buffer;
global.process = process;
global.crypto = crypto;
global.WebSocket = WebSocket;
global.zlib = pako; 