# Computer Networks — Learn Module Masterplan
**Platform: BuildrHQ**
**SubCategory: Computer Networks**
**Total Learns: 44 | Units: 6**

---

## Category Hierarchy

```
LearnMainCategory: "Computer Science"
  └── LearnSubCategory: "Computer Networks"
        ├── slug: "computer-networks"
        ├── icon: "🌐"
        ├── color: "#10B981"
        │
        └── LearnTopics:
              ├── Unit 1 — Network Fundamentals & Models (6 Learns)
              ├── Unit 2 — Physical & Data Link Layer (6 Learns)
              ├── Unit 3 — Network Layer & IP (7 Learns)
              ├── Unit 4 — Transport Layer (6 Learns)
              ├── Unit 5 — Application Layer & Security (7 Learns)
              └── Unit 6 — Advanced Networking & Interview Mastery (6 Learns)
```

---

## UNIT 1 — Network Fundamentals & Models
**Unit Goal:** Build the conceptual foundation — what networks are, how layered models work, and the vocabulary every networking interview expects.

---

### Learn 1.1 — What is a Computer Network?
**Difficulty:** BEGINNER | **Est. Time:** 20 min | **Tags:** `[network, types, topology, bandwidth, latency]`

**Steps:** `EXPLANATION → VISUALIZATION(network types diagram) → QUIZ(4) → SUMMARY`

**What you'll learn:**
- Network definition: interconnected devices sharing resources
- Types: PAN, LAN, MAN, WAN, the Internet
- Network topologies: bus, star, ring, mesh, tree, hybrid
- Key metrics: bandwidth (capacity), latency (delay), throughput, jitter
- Packet switching vs circuit switching — fundamental design choice of the Internet
- Store-and-forward transmission
- Network edge, access networks, and network core

**Interview relevance:** "What is the difference between LAN and WAN?" / "What is packet switching?" — foundational questions.

---

### Learn 1.2 — OSI Model: All 7 Layers
**Difficulty:** BEGINNER | **Est. Time:** 30 min | **Tags:** `[osi, 7-layers, physical, datalink, network, transport, session, presentation, application]`

**Steps:** `EXPLANATION → VISUALIZATION(OSI layer stack + data flow) → COMPARISON(what each layer does) → QUIZ(6) → SUMMARY`

**What you'll learn:**
- Layer 1 Physical: bits, cables, signals, hubs
- Layer 2 Data Link: frames, MAC addresses, switches, error detection
- Layer 3 Network: packets, IP addresses, routing, routers
- Layer 4 Transport: segments, TCP/UDP, port numbers, end-to-end delivery
- Layer 5 Session: session establishment, management, termination
- Layer 6 Presentation: encoding, encryption, compression
- Layer 7 Application: HTTP, DNS, SMTP — user-facing protocols
- Encapsulation: each layer adds its header going down
- Decapsulation: each layer strips its header going up
- Mnemonics for remembering layer order

**Interview relevance:** "Explain the OSI model" — most asked networking interview question. Must be perfect.

---

### Learn 1.3 — TCP/IP Model vs OSI Model
**Difficulty:** BEGINNER | **Est. Time:** 20 min | **Tags:** `[tcp-ip, four-layer, osi-vs-tcpip, internet-model]`

**Steps:** `EXPLANATION → COMPARISON(OSI vs TCP/IP side by side) → VISUALIZATION → QUIZ(4) → SUMMARY`

**What you'll learn:**
- TCP/IP model: 4 layers — Network Access, Internet, Transport, Application
- Mapping OSI layers to TCP/IP layers
- Why TCP/IP is what the real Internet uses
- Application layer in TCP/IP = OSI Layers 5+6+7
- Network Access layer in TCP/IP = OSI Layers 1+2
- Which protocols live at which layer in each model
- Why the OSI model matters despite not being implemented directly
- Practical use: when to say OSI vs TCP/IP in an interview

**Interview relevance:** "Difference between OSI and TCP/IP?" — extremely common follow-up question.

---

### Learn 1.4 — Network Devices: Hub, Switch, Router, Gateway & Firewall
**Difficulty:** BEGINNER | **Est. Time:** 20 min | **Tags:** `[hub, switch, router, gateway, firewall, bridge, layer-2, layer-3]`

**Steps:** `EXPLANATION → COMPARISON(device types) → VISUALIZATION(network diagram) → QUIZ(5) → SUMMARY`

**What you'll learn:**
- **Hub**: Layer 1, broadcasts to all ports, collision domain
- **Switch**: Layer 2, learns MAC addresses, forwards to specific port
- **Router**: Layer 3, routes between networks using IP addresses
- **Bridge**: Layer 2, connects two network segments
- **Gateway**: protocol translator, connects different network types
- **Firewall**: Layer 3/4/7, filters traffic by rules
- **Load Balancer**: distributes traffic across multiple servers
- Collision domain vs broadcast domain
- Why switches replaced hubs

**Interview relevance:** "What is the difference between a switch and a router?" — standard networking question.

---

### Learn 1.5 — Transmission Media & Signal Concepts
**Difficulty:** BEGINNER | **Est. Time:** 20 min | **Tags:** `[twisted-pair, coaxial, fiber-optic, wireless, bandwidth, signal]`

**Steps:** `EXPLANATION → COMPARISON(media types) → QUIZ(4) → SUMMARY`

**What you'll learn:**
- Guided media: twisted pair (UTP/STP), coaxial cable, fiber optic
- Unguided media: radio, microwave, infrared, satellite
- Bandwidth vs throughput vs latency
- Signal attenuation, noise, interference
- Nyquist theorem: max data rate in noiseless channel
- Shannon's theorem: max data rate with noise (channel capacity)
- Multiplexing: FDM, TDM, WDM, CDM
- Switching technologies: circuit, packet, message

**Interview relevance:** Numerical bandwidth/capacity questions; foundational for understanding network limits.

---

### Learn 1.6 — Network Performance: Latency, Bandwidth & Protocols
**Difficulty:** INTERMEDIATE | **Est. Time:** 20 min | **Tags:** `[latency, bandwidth, throughput, rtt, propagation-delay, qos]`

**Steps:** `EXPLANATION → VISUALIZATION(delay components diagram) → QUIZ(4) → SUMMARY`

**What you'll learn:**
- Sources of delay: processing, queuing, transmission, propagation
- Transmission delay = packet size / bandwidth
- Propagation delay = distance / speed of signal
- Round Trip Time (RTT): crucial for TCP performance
- Bandwidth-delay product: how much data is "in flight"
- Throughput vs bandwidth: why they differ
- Quality of Service (QoS): prioritizing traffic types
- Network congestion and its effects

**Interview relevance:** "Why is latency different from bandwidth?" — system design interviews and networking rounds.

---

### Unit 1 Review — Network Fundamentals
**Steps:** `SUMMARY → QUIZ(10) → MOCK_INTERVIEW → PROJECT(mini: Draw and label a network diagram with all devices)`

---
---

## UNIT 2 — Physical & Data Link Layer
**Unit Goal:** Understand how data physically moves and how the data link layer ensures reliable delivery within a network segment.

---

### Learn 2.1 — Data Link Layer: Framing, Error Detection & Correction
**Difficulty:** INTERMEDIATE | **Est. Time:** 30 min | **Tags:** `[data-link, framing, error-detection, crc, parity, checksum]`

**Steps:** `EXPLANATION → VISUALIZATION(frame structure) → CODE(2 blocks: CRC calculation) → QUIZ(5) → CHALLENGE(numerical) → SUMMARY`

**What you'll learn:**
- Data link layer responsibilities: framing, error detection, flow control, access control
- Framing: how to delimit the start and end of frames
- Error types: single-bit, burst errors
- **Parity bits**: even/odd parity, simple but limited
- **Checksum**: sum of data segments, used in TCP/IP
- **CRC** (Cyclic Redundancy Check): polynomial division, very powerful
- **Hamming code**: error correction, not just detection
- Forward Error Correction (FEC) vs Automatic Repeat reQuest (ARQ)

**Interview relevance:** CRC questions appear in networking exams; error detection understanding expected.

---

### Learn 2.2 — Flow Control & Sliding Window Protocols
**Difficulty:** INTERMEDIATE | **Est. Time:** 30 min | **Tags:** `[flow-control, sliding-window, stop-and-wait, go-back-n, selective-repeat]`

**Steps:** `EXPLANATION → VISUALIZATION(sliding window diagrams) → COMPARISON(protocols) → QUIZ(6) → CHALLENGE(numerical) → SUMMARY`

**What you'll learn:**
- Why flow control is needed: fast sender, slow receiver
- **Stop-and-Wait ARQ**: send one frame, wait for ACK — inefficient
- Efficiency of Stop-and-Wait: formula with propagation delay
- **Go-Back-N ARQ**: send N frames, retransmit all from error — sender window size N
- **Selective Repeat ARQ**: only retransmit errored frames — most efficient
- Sliding window concept: window size controls outstanding frames
- Piggybacking: combining ACK with data
- Efficiency formulas: numerical problems

**Interview relevance:** Sliding window efficiency numerical problems are exam standards. TCP uses a sliding window.

---

### Learn 2.3 — MAC Protocols: CSMA/CD, CSMA/CA & Random Access
**Difficulty:** INTERMEDIATE | **Est. Time:** 25 min | **Tags:** `[mac, csma-cd, csma-ca, aloha, collision, ethernet]`

**Steps:** `EXPLANATION → VISUALIZATION(collision detection diagram) → COMPARISON(MAC protocols) → QUIZ(5) → SUMMARY`

**What you'll learn:**
- Multiple Access problem: shared medium, who transmits when?
- **ALOHA**: Pure ALOHA (18.4% efficiency), Slotted ALOHA (36.8%)
- **CSMA** (Carrier Sense Multiple Access): listen before transmitting
- **CSMA/CD**: Ethernet — detect collision, jam, backoff (binary exponential backoff)
- **CSMA/CA**: WiFi — avoid collision (can't detect while transmitting wirelessly)
- Why CSMA/CD doesn't work for wireless
- Token passing: deterministic, no collisions
- TDMA, FDMA, CDMA: channel partitioning

**Interview relevance:** "How does Ethernet handle collisions?" — classic networking question.

---

### Learn 2.4 — MAC Addresses, ARP & Ethernet
**Difficulty:** INTERMEDIATE | **Est. Time:** 25 min | **Tags:** `[mac-address, arp, ethernet, frame-format, broadcast]`

**Steps:** `EXPLANATION → VISUALIZATION(ARP resolution flow) → CODE(2 blocks: Wireshark-style output) → QUIZ(5) → SUMMARY`

**What you'll learn:**
- MAC address: 48-bit hardware address, burned into NIC
- MAC address structure: OUI (manufacturer) + device identifier
- Ethernet frame format: preamble, destination MAC, source MAC, type, data, FCS
- **ARP** (Address Resolution Protocol): IP → MAC address resolution
- ARP request (broadcast) → ARP reply (unicast)
- ARP cache: store resolved entries
- Gratuitous ARP: announce own IP/MAC
- ARP poisoning / spoofing: security attack
- Proxy ARP, Reverse ARP (RARP)

**Interview relevance:** "How does ARP work?" / "What is a MAC address?" — fundamental networking questions.

---

### Learn 2.5 — Switches: How They Work, VLANs & Spanning Tree
**Difficulty:** INTERMEDIATE | **Est. Time:** 25 min | **Tags:** `[switch, mac-table, vlan, spanning-tree, stp, broadcast-domain]`

**Steps:** `EXPLANATION → VISUALIZATION(switch learning + STP diagram) → QUIZ(4) → SUMMARY`

**What you'll learn:**
- Switch learning: builds MAC address table by observing source MACs
- Forwarding decision: unicast (specific port), unknown unicast (flood), broadcast (flood)
- Cut-through vs store-and-forward switching
- **VLAN** (Virtual LAN): logical segmentation of a physical network
- VLAN benefits: security, broadcast containment, flexibility
- 802.1Q VLAN tagging: trunk ports carry multiple VLANs
- **Spanning Tree Protocol (STP)**: prevent Layer 2 loops
- STP states: Blocking → Listening → Learning → Forwarding
- RSTP (Rapid STP): faster convergence

**Interview relevance:** VLANs and STP are core switching concepts for network engineering interviews.

---

### Learn 2.6 — WiFi: 802.11 Standards, Security & Architecture
**Difficulty:** INTERMEDIATE | **Est. Time:** 20 min | **Tags:** `[wifi, 802-11, wpa, ssid, access-point, wireless-security]`

**Steps:** `EXPLANATION → COMPARISON(WiFi standards: a/b/g/n/ac/ax) → QUIZ(4) → SUMMARY`

**What you'll learn:**
- 802.11 standards: b (2.4GHz/11Mbps) → g → n → ac (WiFi 5) → ax (WiFi 6)
- 2.4GHz vs 5GHz: range vs speed trade-off
- SSID, BSSID, access point, BSS, ESS
- WiFi authentication: Open, WEP (broken), WPA, WPA2 (AES/CCMP), WPA3
- 4-way handshake in WPA2: key exchange process
- Hidden SSID: security through obscurity (not real security)
- CSMA/CA in WiFi: RTS/CTS mechanism
- Channels and interference: non-overlapping channels (1, 6, 11)

**Interview relevance:** WiFi security and standards appear in security and networking interviews.

---

### Unit 2 Review — Data Link Layer
**Steps:** `SUMMARY → QUIZ(10) → MOCK_INTERVIEW → PROJECT(mini: Calculate sliding window efficiency)`

---
---

## UNIT 3 — Network Layer & IP
**Unit Goal:** Master IP addressing, routing, and the protocols that make the Internet work. The most tested networking layer in interviews.

---

### Learn 3.1 — IPv4 Addressing, Classes & Subnetting
**Difficulty:** INTERMEDIATE | **Est. Time:** 35 min | **Tags:** `[ipv4, subnetting, cidr, classful, subnet-mask, broadcast]`

**Steps:** `EXPLANATION → VISUALIZATION(IP address structure) → CODE(3 blocks: subnetting examples) → QUIZ(6) → CHALLENGE(numerical) → SUMMARY`

**What you'll learn:**
- IPv4: 32-bit address, dotted decimal notation
- IP address classes: A (0.x.x.x), B (128.x.x.x), C (192.x.x.x), D (multicast), E (reserved)
- Subnet mask: separates network from host portion
- CIDR (Classless Inter-Domain Routing): /24 notation
- Subnetting: divide network into smaller subnets
- Number of subnets and hosts: formulas (2^n, 2^h - 2)
- Network address, broadcast address, valid host range
- Private IP ranges: 10.x, 172.16-31.x, 192.168.x.x
- Loopback: 127.0.0.1
- CIDR supernetting: combining networks

**Interview relevance:** Subnetting numerical questions are in almost every network engineering interview. Practice until fast.

---

### Learn 3.2 — IPv6: Structure, Types & Transition
**Difficulty:** INTERMEDIATE | **Est. Time:** 25 min | **Tags:** `[ipv6, 128-bit, ipv6-types, dual-stack, tunneling, nat64]`

**Steps:** `EXPLANATION → COMPARISON(IPv4 vs IPv6) → VISUALIZATION(IPv6 address types) → QUIZ(4) → SUMMARY`

**What you'll learn:**
- IPv6: 128-bit, hexadecimal, colon notation
- IPv6 address abbreviation rules: leading zeros, consecutive zero groups
- Address types: unicast (global, link-local, loopback), multicast, anycast (no broadcast)
- Link-local: `fe80::/10` — auto-configured, not routable
- Global unicast: routable over Internet
- IPv6 header: simpler than IPv4, extension headers
- Why IPv6: IPv4 exhaustion, better routing, built-in security
- Transition mechanisms: dual-stack, tunneling (6in4, Teredo), NAT64
- NDP (Neighbor Discovery Protocol): replaces ARP in IPv6

**Interview relevance:** "Why do we need IPv6?" / "What is the difference between IPv4 and IPv6?" — very common.

---

### Learn 3.3 — IP Routing: How Routers Forward Packets
**Difficulty:** INTERMEDIATE | **Est. Time:** 25 min | **Tags:** `[routing, routing-table, forwarding, longest-prefix, default-route]`

**Steps:** `EXPLANATION → VISUALIZATION(routing table lookup) → CODE(2 blocks: routing table examples) → QUIZ(4) → SUMMARY`

**What you'll learn:**
- Routing vs forwarding: routing = building tables, forwarding = using tables
- Routing table entries: destination network, subnet mask, next hop, interface, metric
- Longest prefix match: how routers choose the most specific route
- Default route (0.0.0.0/0): the "catch-all" route
- Static routing: manually configured, simple but doesn't scale
- Dynamic routing: protocols automatically update tables
- Administrative distance: trust ranking for routes from different sources
- How a packet traverses multiple routers (hop-by-hop forwarding)

**Interview relevance:** "How does a router decide where to send a packet?" — fundamental routing question.

---

### Learn 3.4 — Routing Protocols: RIP, OSPF & BGP
**Difficulty:** INTERMEDIATE | **Est. Time:** 30 min | **Tags:** `[rip, ospf, bgp, distance-vector, link-state, igp, egp]`

**Steps:** `EXPLANATION → COMPARISON(routing protocols) → VISUALIZATION(routing algorithm diagrams) → QUIZ(5) → SUMMARY`

**What you'll learn:**
- IGP (Interior Gateway Protocol): within one AS (autonomous system)
- EGP (Exterior Gateway Protocol): between ASes
- **Distance Vector (RIP)**: share entire routing table with neighbors, count-to-infinity problem, Bellman-Ford algorithm, max 15 hops
- **Link State (OSPF)**: flood link states to all routers, each builds full topology, Dijkstra's algorithm, areas, hello packets, DR/BDR election
- **BGP** (Border Gateway Protocol): the Internet's routing protocol, path vector, policy-based, TCP port 179
- EIGRP: Cisco proprietary, hybrid protocol
- Route redistribution: between different routing protocols

**Interview relevance:** "What is the difference between OSPF and RIP?" / "What is BGP?" — networking and DevOps interviews.

---

### Learn 3.5 — NAT, DHCP & ICMP
**Difficulty:** INTERMEDIATE | **Est. Time:** 30 min | **Tags:** `[nat, dhcp, icmp, ping, traceroute, pat, private-ip]`

**Steps:** `EXPLANATION → VISUALIZATION(NAT translation diagram) → CODE(3 blocks) → QUIZ(5) → SUMMARY`

**What you'll learn:**
- **NAT** (Network Address Translation): many private IPs → one public IP
- PAT (Port Address Translation) / NAT overload: most common form
- Static NAT, Dynamic NAT, PAT
- NAT table: maps (private IP, port) → (public IP, port)
- Why NAT breaks end-to-end connectivity and complicates protocols
- **DHCP**: automatically assigns IP, subnet mask, gateway, DNS
- DHCP process: Discover → Offer → Request → Acknowledge (DORA)
- DHCP lease time and renewal
- **ICMP**: error reporting and diagnostics
- `ping`: ICMP Echo Request/Reply
- `traceroute`: uses TTL expiry to trace path
- ICMP error messages: Destination Unreachable, Time Exceeded, Redirect

**Interview relevance:** "What is NAT?" / "How does DHCP work?" / "What does ping use?" — very frequently asked.

---

### Learn 3.6 — IP Fragmentation, TTL & IPv4 Header
**Difficulty:** INTERMEDIATE | **Est. Time:** 20 min | **Tags:** `[ip-header, ttl, fragmentation, mtu, checksum]`

**Steps:** `EXPLANATION → VISUALIZATION(IPv4 header fields) → QUIZ(4) → SUMMARY`

**What you'll learn:**
- IPv4 header structure: version, IHL, DSCP, total length, identification, flags, fragment offset, TTL, protocol, checksum, source/destination IP
- TTL (Time To Live): decremented at each hop, prevents infinite loops
- MTU (Maximum Transmission Unit): max frame payload size (Ethernet = 1500 bytes)
- IP fragmentation: split packets larger than MTU
- Fragment reassembly: only at destination
- "Don't Fragment" (DF) bit and Path MTU Discovery
- Protocol field: 6=TCP, 17=UDP, 1=ICMP, 89=OSPF

**Interview relevance:** Detailed protocol knowledge tested in network engineering and protocol implementation roles.

---

### Learn 3.7 — Network Address Design & VPNs
**Difficulty:** INTERMEDIATE | **Est. Time:** 20 min | **Tags:** `[vpc, vpn, tunnel, ipsec, network-design]`

**Steps:** `EXPLANATION → VISUALIZATION(VPN tunnel diagram) → COMPARISON(VPN types) → QUIZ(3) → SUMMARY`

**What you'll learn:**
- VPN (Virtual Private Network): encrypted tunnel over public network
- Site-to-site VPN vs remote-access VPN
- IPsec: authentication + encryption for IP packets (AH, ESP)
- SSL/TLS VPN: OpenVPN, works at application layer
- VPN use cases: remote work, site-to-site corporate connectivity
- Tunneling protocols: GRE, L2TP, PPTP (deprecated)
- Cloud networking: VPC (Virtual Private Cloud), subnets, security groups
- Network design principles: DMZ, segmentation, zero trust

**Interview relevance:** VPN and cloud networking (VPC) appear in cloud/DevOps/security interviews.

---

### Unit 3 Review — Network Layer
**Steps:** `SUMMARY → QUIZ(12) → MOCK_INTERVIEW → PROJECT(mini: Subnet a given IP space for a company network)`

---
---

## UNIT 4 — Transport Layer
**Unit Goal:** Deeply understand TCP and UDP — the two protocols that power essentially all Internet applications. TCP internals are heavily tested.

---

### Learn 4.1 — Transport Layer: Ports, Multiplexing & Sockets
**Difficulty:** BEGINNER | **Est. Time:** 20 min | **Tags:** `[ports, multiplexing, socket, well-known-ports, ephemeral-ports]`

**Steps:** `EXPLANATION → VISUALIZATION(port multiplexing diagram) → QUIZ(4) → SUMMARY`

**What you'll learn:**
- Transport layer role: end-to-end delivery between processes (not hosts)
- Port numbers: 16-bit, identifies application on a host
- Well-known ports: 80 (HTTP), 443 (HTTPS), 22 (SSH), 25 (SMTP), 53 (DNS), 21 (FTP)
- Ephemeral ports: 49152-65535, client-side temporary ports
- Socket: (IP address, port, protocol) — unique endpoint identifier
- Socket pair: uniquely identifies a connection: (src IP, src port, dst IP, dst port)
- Multiplexing (sender): combine multiple streams into segments
- Demultiplexing (receiver): deliver segments to correct process
- Connection-oriented vs connectionless demultiplexing

**Interview relevance:** "What is a socket?" / "What is port 443?" — common questions.

---

### Learn 4.2 — UDP: Connectionless, Fast & When to Use It
**Difficulty:** BEGINNER | **Est. Time:** 20 min | **Tags:** `[udp, connectionless, datagram, dns, streaming, gaming]`

**Steps:** `EXPLANATION → COMPARISON(UDP vs TCP quick view) → CODE(2 blocks: UDP socket) → QUIZ(4) → SUMMARY`

**What you'll learn:**
- UDP: User Datagram Protocol — connectionless, no handshake
- UDP header: source port, destination port, length, checksum (only 8 bytes)
- No reliability: no retransmission, no ordering, no flow control
- Why UDP exists: low overhead, low latency
- UDP use cases: DNS, DHCP, TFTP, VoIP, video streaming, online gaming, NTP
- UDP with application-layer reliability: QUIC (HTTP/3)
- UDP checksum: optional in IPv4, mandatory in IPv6
- Broadcast and multicast only possible with UDP

**Interview relevance:** "When would you use UDP over TCP?" — classic protocol selection question.

---

### Learn 4.3 — TCP: Connections, Three-Way Handshake & Four-Way Termination
**Difficulty:** INTERMEDIATE | **Est. Time:** 30 min | **Tags:** `[tcp, three-way-handshake, connection, syn, ack, fin, tcp-states]`

**Steps:** `EXPLANATION → VISUALIZATION(handshake + termination diagrams) → CODE(2 blocks) → QUIZ(6) → CHALLENGE → SUMMARY`

**What you'll learn:**
- TCP: Transmission Control Protocol — connection-oriented, reliable, ordered, error-checked
- **Three-way handshake**: SYN → SYN-ACK → ACK (why three steps?)
- ISN (Initial Sequence Number): random, prevents old packet confusion
- **Four-way termination**: FIN → ACK → FIN → ACK
- Why termination is four steps (half-close)
- TIME_WAIT state: why it exists, 2*MSL duration
- TCP states: LISTEN, SYN-SENT, SYN-RECEIVED, ESTABLISHED, FIN-WAIT, CLOSE-WAIT, LAST-ACK, TIME-WAIT, CLOSED
- SYN flood attack and SYN cookies mitigation
- Half-open connections

**Interview relevance:** "Explain the TCP three-way handshake" — one of the most asked networking questions ever.

---

### Learn 4.4 — TCP Reliability: Sequence Numbers, ACKs & Retransmission
**Difficulty:** INTERMEDIATE | **Est. Time:** 30 min | **Tags:** `[sequence-numbers, acknowledgement, retransmission, rto, duplicate-ack]`

**Steps:** `EXPLANATION → VISUALIZATION(sequence number flow) → CODE(2 blocks) → QUIZ(5) → SUMMARY`

**What you'll learn:**
- Sequence numbers: byte-based, track position in stream
- Cumulative ACK: ACK number = next expected byte
- Retransmission timer (RTO): exponential backoff on timeout
- RTT estimation: Jacobson's algorithm, EWMA
- Duplicate ACKs: signal packet loss without timeout
- Fast retransmit: retransmit after 3 duplicate ACKs
- SACK (Selective Acknowledgment): ACK specific received bytes
- Out-of-order packets and TCP's handling
- Nagle's algorithm: buffer small sends to reduce overhead

**Interview relevance:** TCP reliability internals for network engineering and protocol implementation roles.

---

### Learn 4.5 — TCP Flow Control & Congestion Control
**Difficulty:** INTERMEDIATE | **Est. Time:** 35 min | **Tags:** `[flow-control, congestion-control, window-size, slow-start, congestion-avoidance, bbr]`

**Steps:** `EXPLANATION → VISUALIZATION(congestion window evolution) → COMPARISON(congestion algorithms) → QUIZ(6) → CHALLENGE → SUMMARY`

**What you'll learn:**
- **Flow control**: receiver controls send rate via receive window (rwnd)
- Zero window: receiver advertises 0 rwnd to pause sender
- Window scaling option: for high-bandwidth-delay networks
- **Congestion control**: sender controls rate based on network congestion
- **Slow Start**: start with cwnd=1, double every RTT until ssthresh
- **Congestion Avoidance**: linear increase after ssthresh
- **Fast Recovery**: after 3 dup ACKs, halve cwnd, don't go to slow start
- **Timeout**: cwnd → 1, ssthresh → cwnd/2, back to slow start
- AIMD (Additive Increase Multiplicative Decrease): the core principle
- Modern algorithms: TCP CUBIC (Linux default), BBR (Google)
- Explicit Congestion Notification (ECN): routers signal congestion in-band

**Interview relevance:** "How does TCP congestion control work?" — senior networking and backend interviews.

---

### Learn 4.6 — QUIC & HTTP/3: The Modern Transport
**Difficulty:** ADVANCED | **Est. Time:** 20 min | **Tags:** `[quic, http3, udp, multiplexing, 0-rtt, head-of-line-blocking]`

**Steps:** `EXPLANATION → COMPARISON(HTTP/1.1 vs HTTP/2 vs HTTP/3) → VISUALIZATION → QUIZ(4) → SUMMARY`

**What you'll learn:**
- Problems with TCP for web: head-of-line blocking, slow handshake
- HTTP/2 multiplexing: multiple streams on one TCP connection
- HTTP/2 head-of-line blocking: one lost packet stalls all streams
- QUIC: built on UDP, implements reliability + TLS at transport layer
- QUIC connection establishment: 0-RTT or 1-RTT (vs TCP+TLS = 2-3 RTT)
- QUIC stream multiplexing: independent streams, no head-of-line blocking
- HTTP/3 = HTTP over QUIC
- Connection migration: QUIC connections survive IP change (mobile)
- Where HTTP/3 is used: Google, Cloudflare, Facebook

**Interview relevance:** Modern protocol knowledge; "Why HTTP/3?" appears in senior engineering interviews.

---

### Unit 4 Review — Transport Layer
**Steps:** `SUMMARY → QUIZ(10) → MOCK_INTERVIEW → PROJECT(mini: Trace TCP connection with Wireshark walkthrough)`

---
---

## UNIT 5 — Application Layer & Network Security
**Unit Goal:** Learn the protocols you interact with every day — DNS, HTTP, TLS, email protocols — and the security mechanisms that protect them.

---

### Learn 5.1 — DNS: How the Internet Resolves Names
**Difficulty:** INTERMEDIATE | **Est. Time:** 30 min | **Tags:** `[dns, resolution, recursive, iterative, ttl, record-types, dnssec]`

**Steps:** `EXPLANATION → VISUALIZATION(DNS resolution flow) → CODE(2 blocks: dig/nslookup) → QUIZ(5) → CHALLENGE → SUMMARY`

**What you'll learn:**
- DNS: maps domain names to IP addresses (and more)
- DNS hierarchy: root → TLD (.com, .org) → authoritative nameserver
- **Recursive resolver**: queries on behalf of client until answer found
- **Iterative resolution**: each server returns referral to next server
- DNS caching: TTL controls how long answers are cached
- Record types: A (IPv4), AAAA (IPv6), CNAME (alias), MX (mail), NS (nameserver), TXT, PTR (reverse DNS), SRV
- DNS over UDP port 53 (queries), TCP port 53 (zone transfers, large responses)
- DNS zone transfer: AXFR — security risk if unrestricted
- DNSSEC: digital signatures to prevent DNS poisoning
- DNS-over-HTTPS (DoH) and DNS-over-TLS (DoT): encrypted DNS
- Common DNS attacks: cache poisoning, DDoS amplification

**Interview relevance:** "What happens when you type google.com?" — the most famous interview question starts with DNS.

---

### Learn 5.2 — HTTP: Protocol Deep Dive (1.0, 1.1, 2.0)
**Difficulty:** INTERMEDIATE | **Est. Time:** 30 min | **Tags:** `[http, request-response, methods, headers, status-codes, cookies, sessions]`

**Steps:** `EXPLANATION → VISUALIZATION(HTTP request/response) → CODE(3 blocks: raw HTTP) → QUIZ(6) → CHALLENGE → SUMMARY`

**What you'll learn:**
- HTTP: stateless application protocol over TCP
- HTTP request: method, URL, version, headers, body
- HTTP methods: GET, POST, PUT, PATCH, DELETE, HEAD, OPTIONS
- HTTP status codes: 1xx (informational), 2xx (success), 3xx (redirect), 4xx (client error), 5xx (server error)
- Key status codes: 200, 201, 204, 301, 302, 304, 400, 401, 403, 404, 500, 503
- HTTP headers: Content-Type, Authorization, Cache-Control, Accept, CORS headers
- HTTP/1.0: new connection per request
- HTTP/1.1: persistent connections, pipelining, chunked transfer
- HTTP/2: multiplexing, header compression (HPACK), server push, binary framing
- Cookies: Set-Cookie, session management, HttpOnly, Secure, SameSite flags
- Caching: Cache-Control, ETag, Last-Modified, 304 Not Modified

**Interview relevance:** HTTP is tested in virtually every backend, full-stack, and API interview.

---

### Learn 5.3 — HTTPS & TLS: How Secure Communication Works
**Difficulty:** INTERMEDIATE | **Est. Time:** 30 min | **Tags:** `[https, tls, ssl, certificate, handshake, symmetric, asymmetric, pki]`

**Steps:** `EXPLANATION → VISUALIZATION(TLS handshake flow) → COMPARISON(TLS 1.2 vs 1.3) → QUIZ(5) → SUMMARY`

**What you'll learn:**
- Why HTTP is insecure: plaintext, MITM attacks
- TLS (Transport Layer Security): provides confidentiality, integrity, authentication
- **TLS handshake (1.2)**: ClientHello → ServerHello → Certificate → Key Exchange → Finished (2 RTT)
- **TLS 1.3**: simplified, 1-RTT handshake, 0-RTT resumption
- Asymmetric encryption: RSA/ECDHE for key exchange
- Symmetric encryption: AES-GCM for bulk data (after handshake)
- Digital certificates: X.509, signed by Certificate Authority (CA)
- PKI (Public Key Infrastructure): trust chain, root CA, intermediate CA
- Certificate validation: chain of trust, revocation (CRL, OCSP)
- HSTS (HTTP Strict Transport Security): browser always uses HTTPS
- Certificate pinning: trust specific certificate, not just any CA

**Interview relevance:** "How does HTTPS work?" — top 5 backend engineering interview question.

---

### Learn 5.4 — Email Protocols: SMTP, POP3 & IMAP
**Difficulty:** INTERMEDIATE | **Est. Time:** 20 min | **Tags:** `[smtp, pop3, imap, email, mta, mua, spf, dkim, dmarc]`

**Steps:** `EXPLANATION → VISUALIZATION(email delivery flow) → COMPARISON(POP3 vs IMAP) → QUIZ(4) → SUMMARY`

**What you'll learn:**
- Email sending: **SMTP** (Simple Mail Transfer Protocol) — port 25/465/587
- Email retrieval: **POP3** (port 110/995) — downloads and deletes from server
- Email retrieval: **IMAP** (port 143/993) — syncs, keeps on server, multiple devices
- MUA (Mail User Agent), MTA (Mail Transfer Agent), MDA (Mail Delivery Agent)
- Email delivery path: sender → sender's SMTP → recipient's MTA → mailbox → IMAP/POP3
- **SPF**: authorizes sending IPs for a domain
- **DKIM**: cryptographic signature on emails
- **DMARC**: policy for handling SPF/DKIM failures
- Common attacks: phishing, email spoofing, open relay

**Interview relevance:** Email protocol knowledge for backend and infrastructure roles.

---

### Learn 5.5 — Network Security Fundamentals: Attacks & Defenses
**Difficulty:** INTERMEDIATE | **Est. Time:** 30 min | **Tags:** `[security, ddos, mitm, firewall, ids-ips, zero-trust, attack-types]`

**Steps:** `EXPLANATION → COMPARISON(attack types) → VISUALIZATION(attack flows) → QUIZ(5) → SUMMARY`

**What you'll learn:**
- **DoS / DDoS**: overwhelm target with traffic; volumetric, protocol, application layer attacks
- **MITM** (Man-in-the-Middle): intercept communication; ARP spoofing, SSL stripping
- **Packet sniffing**: passive interception on shared networks
- **SQL injection / XSS**: application-layer attacks (cross-layer awareness)
- **Replay attack**: capture and re-send valid authentication
- **Firewall types**: packet filter, stateful inspection, application-layer (WAF)
- **IDS / IPS**: intrusion detection vs intrusion prevention
- **Zero trust**: never trust, always verify — no implicit trust inside network
- **DMZ**: demilitarized zone for publicly accessible servers
- Defense in depth: multiple security layers

**Interview relevance:** Security fundamentals for backend, DevOps, and security engineering interviews.

---

### Learn 5.6 — SSH, FTP, WebSockets & Other Application Protocols
**Difficulty:** INTERMEDIATE | **Est. Time:** 25 min | **Tags:** `[ssh, ftp, websocket, rpc, grpc, snmp, ntp]`

**Steps:** `EXPLANATION → COMPARISON(protocols table) → CODE(2 blocks) → QUIZ(4) → SUMMARY`

**What you'll learn:**
- **SSH**: encrypted remote shell, port 22, public key authentication, SSH tunneling
- **FTP / SFTP / FTPS**: file transfer — FTP insecure, SFTP (SSH-based), FTPS (TLS-based)
- **WebSocket**: full-duplex persistent connection over HTTP, real-time apps
- WebSocket handshake: starts as HTTP, upgrades via `Upgrade: websocket` header
- **RPC / gRPC**: Remote Procedure Call — treat remote function like local call
- gRPC: HTTP/2, Protocol Buffers, streaming support
- **SNMP**: network device monitoring (port 161/162)
- **NTP**: Network Time Protocol — clock synchronization, why it matters
- **Telnet**: insecure predecessor to SSH (deprecated, still asked about)

**Interview relevance:** SSH and WebSocket questions appear in backend and real-time application interviews.

---

### Learn 5.7 — CDN, Proxies, Load Balancers & Caching
**Difficulty:** INTERMEDIATE | **Est. Time:** 25 min | **Tags:** `[cdn, proxy, reverse-proxy, load-balancer, cache, edge]`

**Steps:** `EXPLANATION → VISUALIZATION(CDN architecture) → COMPARISON(forward vs reverse proxy) → QUIZ(4) → SUMMARY`

**What you'll learn:**
- **Forward proxy**: client-side proxy, hide client identity, content filtering
- **Reverse proxy**: server-side proxy, hide server, load balancing, SSL termination
- **CDN** (Content Delivery Network): edge servers geographically close to users
- CDN caching: static assets, cache-hit vs cache-miss
- CDN benefits: reduce latency, absorb traffic spikes
- **Load balancer**: distribute traffic across servers
- Load balancing algorithms: round robin, least connections, IP hash, weighted
- Layer 4 vs Layer 7 load balancing
- Health checks and failover
- **Nginx / HAProxy**: common reverse proxy / load balancer tools

**Interview relevance:** CDN, load balancer, and reverse proxy are fundamental system design building blocks.

---

### Unit 5 Review — Application Layer & Security
**Steps:** `SUMMARY → QUIZ(12) → MOCK_INTERVIEW → PROJECT(mini: Map the full journey of a HTTPS request end-to-end)`

---
---

## UNIT 6 — Advanced Networking & Interview Mastery
**Unit Goal:** Cover SDN, cloud networking, network troubleshooting, and master the ability to answer any networking question in an interview setting.

---

### Learn 6.1 — Software Defined Networking (SDN) & Network Virtualization
**Difficulty:** ADVANCED | **Est. Time:** 25 min | **Tags:** `[sdn, openflow, control-plane, data-plane, nfv, overlay]`

**Steps:** `EXPLANATION → VISUALIZATION(SDN architecture) → COMPARISON(traditional vs SDN) → QUIZ(4) → SUMMARY`

**What you'll learn:**
- Traditional networking: control plane + data plane tightly coupled per device
- SDN: decouple control plane (centralized controller) from data plane (forwarding)
- SDN benefits: programmability, centralized management, easier automation
- OpenFlow: communication protocol between SDN controller and switches
- NFV (Network Functions Virtualization): run network functions as software on commodity hardware
- Overlay networks: virtual network on top of physical (VXLAN, GRE)
- VXLAN: L2 over L3, 24-bit VNI (16M segments vs VLAN's 4096)
- Intent-based networking: declarative network configuration
- Where SDN is used: cloud data centers, SD-WAN

**Interview relevance:** Cloud and infrastructure engineering interviews at senior level.

---

### Learn 6.2 — Cloud Networking: AWS VPC & Azure VNet Deep Dive
**Difficulty:** INTERMEDIATE | **Est. Time:** 25 min | **Tags:** `[vpc, aws, azure, security-groups, nacl, peering, transit-gateway]`

**Steps:** `EXPLANATION → VISUALIZATION(VPC architecture diagram) → COMPARISON(security group vs NACL) → QUIZ(4) → SUMMARY`

**What you'll learn:**
- VPC (Virtual Private Cloud): isolated virtual network in cloud
- Subnets: public (internet-accessible) vs private
- Internet Gateway: connects VPC to internet
- Route tables: control traffic routing within VPC
- **Security Groups**: stateful, instance-level firewall (allow rules only)
- **NACLs** (Network ACLs): stateless, subnet-level, allow and deny rules
- NAT Gateway: private subnets access internet without exposure
- VPC Peering: connect two VPCs (non-transitive)
- Transit Gateway: hub-and-spoke VPC connectivity
- AWS Direct Connect / Azure ExpressRoute: dedicated private connection to cloud
- Elastic IP, ENI (Elastic Network Interface)

**Interview relevance:** Cloud networking is mandatory for cloud engineer and backend engineer roles.

---

### Learn 6.3 — Network Troubleshooting & Diagnostic Tools
**Difficulty:** INTERMEDIATE | **Est. Time:** 25 min | **Tags:** `[troubleshooting, ping, traceroute, netstat, dig, tcpdump, wireshark, nmap]`

**Steps:** `EXPLANATION → CODE(5 blocks: tool usage examples) → QUIZ(4) → CHALLENGE → SUMMARY`

**What you'll learn:**
- **ping**: test reachability, measure RTT, ICMP echo
- **traceroute / tracert**: discover path, identify slow hops
- **netstat / ss**: show connections, listening ports, socket states
- **dig / nslookup**: DNS lookups, query specific record types
- **tcpdump**: capture and analyze packets from command line
- **Wireshark**: GUI packet capture and analysis
- **nmap**: port scanning, service detection, OS fingerprinting
- **curl**: test HTTP endpoints, see headers, follow redirects
- **mtr**: continuous traceroute with statistics
- Troubleshooting methodology: OSI layer by layer approach
- Common scenarios: can ping IP but not hostname (DNS), can't reach port (firewall)

**Interview relevance:** Practical troubleshooting is tested in SRE and DevOps interviews.

---

### Learn 6.4 — Wireless Networks, Cellular & IoT Networking
**Difficulty:** INTERMEDIATE | **Est. Time:** 20 min | **Tags:** `[wireless, cellular, 4g, 5g, iot, bluetooth, zigbee]`

**Steps:** `EXPLANATION → COMPARISON(wireless technologies) → QUIZ(3) → SUMMARY`

**What you'll learn:**
- Cellular generations: 2G (GSM), 3G (UMTS), 4G LTE, 5G NR
- 5G: sub-6GHz vs mmWave, massive MIMO, network slicing, ultra-low latency
- Mobile data: evolved packet core, handover, roaming
- **Bluetooth**: short range, piconet, BLE (Bluetooth Low Energy) for IoT
- **Zigbee / Z-Wave**: low-power mesh for smart home
- **LoRaWAN**: long range, low power for IoT
- **NFC**: Near Field Communication, contactless payments
- Satellite internet: Starlink LEO constellation
- Edge computing: processing data close to IoT devices

**Interview relevance:** IoT and mobile roles; 5G questions increasingly common.

---

### Learn 6.5 — "What Happens When You Type google.com?" — Complete Walkthrough
**Difficulty:** ALL LEVELS | **Est. Time:** 35 min | **Tags:** `[end-to-end, dns, tcp, tls, http, full-stack-networking]`

**Steps:** `EXPLANATION → VISUALIZATION(full journey diagram) → CODE(3 blocks: each phase) → QUIZ(6) → MOCK_INTERVIEW → SUMMARY`

**What you'll learn (every step of the full journey):**
1. Browser checks cache (DNS, HTTP)
2. OS DNS resolver → recursive resolver → root → TLD → authoritative
3. TCP three-way handshake to resolved IP:443
4. TLS handshake: certificate validation, cipher negotiation, session keys
5. HTTP/2 GET request sent over encrypted TLS channel
6. Request traverses: client → ISP → internet backbone → CDN edge / origin server
7. Server processes request, generates response
8. HTTP response with status 200, headers, body
9. Browser renders HTML, fires more DNS/TCP/HTTP for CSS/JS/images
10. Connection kept alive (persistent) or closed
- How to use this question to demonstrate knowledge of every networking layer

**Interview relevance:** This IS the most famous interview question. This Learn is pure interview gold.

---

### Learn 6.6 — Networking Interview Masterclass
**Difficulty:** ALL LEVELS | **Est. Time:** 35 min | **Tags:** `[interview-prep, patterns, cheatsheet, troubleshooting-scenarios]`

**Steps:** `EXPLANATION → CODE(5 blocks: scenario walkthroughs) → QUIZ(8) → MOCK_INTERVIEW → CHALLENGE(3) → SUMMARY`

**What you'll learn:**
- Top 30 networking interview questions with structured answers
- How to answer "explain protocol X" questions: purpose → how it works → example → security
- Diagram-based answers: OSI stack, DNS resolution, TCP handshake, TLS flow
- Common scenario questions: "user can't access website" — systematic diagnosis
- Comparison questions: TCP vs UDP, HTTP vs HTTPS, IPv4 vs IPv6
- Subnetting speed: practice quick mental calculation method
- "What happens when..." question framework
- OSI layer categorization: quickly identify which layer each protocol belongs to
- Networking for system design: when to mention CDN, load balancer, VPC in design interviews

**Interview relevance:** This entire Learn IS the interview prep. Every topic mapped to question type.

---

### Unit 6 Review — Full Networking Mock Interview & Capstone
**Steps:** `SUMMARY → QUIZ(15 mixed) → MOCK_INTERVIEW → PROJECT(major: Design the network architecture for a web application on AWS)`

---
---

## Summary: Complete Learn Count

| Unit | Topic | Learns |
|------|-------|--------|
| Unit 1 | Network Fundamentals & Models | 6 + 1 review = **7** |
| Unit 2 | Physical & Data Link Layer | 6 + 1 review = **7** |
| Unit 3 | Network Layer & IP | 7 + 1 review = **8** |
| Unit 4 | Transport Layer | 6 + 1 review = **7** |
| Unit 5 | Application Layer & Security | 7 + 1 review = **8** |
| Unit 6 | Advanced Networking & Interview Mastery | 6 + 1 review = **7** |
| **TOTAL** | | **44 Learns** |

---

## Step Template Reference

Standard Learn flow:
```
EXPLANATION → [VISUALIZATION?] → CODE → [COMPARISON?] → QUIZ → CHALLENGE → [RESOURCE?] → SUMMARY
```

Unit-end Learns:
```
SUMMARY(recap) → QUIZ(10-15) → MOCK_INTERVIEW → PROJECT
```

---

*Document created for BuildrHQ — Computer Networks Learn Module*