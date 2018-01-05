import React, { Component } from 'react';

class Form extends React.Component {
  render() {
    return (
      <React.Fragment>
        <h1>New Inventory Item Type</h1>
        <div className="form-container">
          <form>
            <div className="form-group row">
              <label for="itemTypeName" className="col-sm-3 col-form-label">
                Name
              </label>
              <div class="col-sm-9">
                <input
                  type="text"
                  className="form-control"
                  id="itemTypeName"
                  placeholder="Enter name"
                />
              </div>
            </div>
            <div className="form-group row">
              <label for="itemTypeCategory" className="col-sm-3 col-form-label">
                Category
              </label>
              <div class="col-sm-9">
                <select className="form-control" id="itemTypeCategory">
                  <option>Electrical</option>
                  <option>SanitaryWare</option>
                </select>
              </div>
            </div>
            <div className="form-group row">
              <label for="itemTypeCurrentStock" className="col-sm-3 col-form-label">
                Current Stock
              </label>
              <div class="col-sm-9">
                <input
                  type="text"
                  className="form-control"
                  id="itemTypeCurrentStock"
                  placeholder="Current stock level"
                />
              </div>
            </div>
            <div className="form-group row">
              <label for="itemTypeMinimumStock" className="col-sm-3 col-form-label">
                Minimum Stock
              </label>
              <div class="col-sm-9">
                <input
                  type="text"
                  className="form-control"
                  id="itemTypeMinimumStock"
                  placeholder="Minimum stock level"
                />
              </div>
            </div>
            <div className="form-controls">
              <button type="submit" className="btn btn-primary">
                Save
              </button>
            </div>
          </form>
        </div>
      </React.Fragment>
    );
  }
}

export default Form;
