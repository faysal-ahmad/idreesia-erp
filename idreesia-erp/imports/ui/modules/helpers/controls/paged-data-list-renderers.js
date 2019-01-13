import React from "react";
import { Avatar } from "antd";
import { Link } from "react-router-dom";

import getDownloadUrl from "../misc/get-download-url";

const NameDivStyle = {
  display: "flex",
  flexFlow: "row nowrap",
  justifyContent: "flex-start",
  alignItems: "center",
  width: "100%",
};

export function getNameWithImageRenderer(id, imageId, name, modulePath) {
  if (imageId) {
    const url = getDownloadUrl(imageId);
    return (
      <div style={NameDivStyle}>
        <Avatar shape="square" size="large" src={url} />
        &nbsp;
        <Link to={`${modulePath}/${id}`}>{name}</Link>
      </div>
    );
  }

  return (
    <div style={NameDivStyle}>
      <Avatar shape="square" size="large" icon="user" />
      &nbsp;
      <Link to={`${modulePath}/${id}`}>{name}</Link>
    </div>
  );
}
