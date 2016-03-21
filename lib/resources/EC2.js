"use strict";

const AWS = require("aws-sdk-promise");
const co = require("co");
const Utility = require("../utility");

class EC2 {
  constructor(opts) {
    this.resource = new AWS.EC2(opts);
  }
  describe() {
    const self = this;
    return co(function*() {
      return {
        CustomerGateways: (yield self.resource.describeCustomerGateways().promise()).data.CustomerGateways.map(Utility.addACIKey("EC2_CustomerGateways", "CustomerGatewayId")),
        Images: (yield self.resource.describeImages({ Filters: [ { Name: "is-public", Values: [ "false" ] } ] }).promise()).data.Images.map(Utility.addACIKey("EC2_Images", "ImageId")),
        Reservations: (yield self.resource.describeInstances().promise()).data.Reservations.map(Utility.addACIKey("EC2_Reservations", "ReservationId")),
        InternetGateways: (yield self.resource.describeInternetGateways().promise()).data.InternetGateways.map(Utility.addACIKey("EC2_InternetGateways", "InternetGatewayId")),
        KeyPairs: (yield self.resource.describeKeyPairs().promise()).data.KeyPairs.map(Utility.addACIKey("EC2_KeyPairs", "KeyName")),
        NatGateways: (yield self.resource.describeNatGateways().promise()).data.NatGateways.map(Utility.addACIKey("EC2_NatGateways", "NatGatewayId")),
        NetworkAcls: (yield self.resource.describeNetworkAcls().promise()).data.NetworkAcls.map(Utility.addACIKey("EC2_NetworkAcls", "NetworkAclId")),
        NetworkInterfaces: (yield self.resource.describeNetworkInterfaces().promise()).data.NetworkInterfaces.map(Utility.addACIKey("EC2_NetworkInterfaces", "NetworkInterfaceId")),
        ReservedInstances: (yield self.resource.describeReservedInstances().promise()).data.ReservedInstances.map(Utility.addACIKey("EC2_ReservedInstances", "ReservedInstancesId")),
        RouteTables: (yield self.resource.describeRouteTables().promise()).data.RouteTables.map(Utility.addACIKey("EC2_RouteTables", "RouteTableId")),
        SecurityGroups: (yield self.resource.describeSecurityGroups().promise()).data.SecurityGroups.map(Utility.addACIKey("EC2_SecurityGroups", "GroupId")),
        Subnets: (yield self.resource.describeSubnets().promise()).data.Subnets.map(Utility.addACIKey("EC2_Subnets", "SubnetId")),
        VpcEndpoints: (yield self.resource.describeVpcEndpoints().promise()).data.VpcEndpoints.map(Utility.addACIKey("EC2_VpcEndpoints", "VpcEndpointId")),
        Vpcs: (yield self.resource.describeVpcs().promise()).data.Vpcs.map(Utility.addACIKey("EC2_Vpcs", "VpcId")),
        VpnConnections: (yield self.resource.describeVpnConnections().promise()).data.VpnConnections.map(Utility.addACIKey("EC2_VpnConnections", "VpnConnectionId")),
        VpnGateways: (yield self.resource.describeVpnGateways().promise()).data.VpnGateways.map(Utility.addACIKey("EC2_VpnGateways", "VpnGatewayId"))
      };
    });
  }
}

module.exports = EC2;
