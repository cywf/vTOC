from datetime import datetime

from app import models, schemas


def test_metadata_columns_avoid_reserved_declarative_attribute() -> None:
    assert models.BaseStation.metadata_json.property.columns[0].name == "metadata"
    assert models.Device.metadata_json.property.columns[0].name == "metadata"
    assert "metadata" in models.BaseStation.__table__.columns
    assert "metadata" in models.Device.__table__.columns


def test_base_station_schema_reads_metadata_from_orm_attribute() -> None:
    timestamp = datetime(2026, 7, 20)
    station = models.BaseStation(
        id=1,
        station_id=2,
        slug="ops-base",
        name="Operations Base",
        description=None,
        status="active",
        latitude=None,
        longitude=None,
        altitude_m=None,
        metadata_json={"network": "mesh"},
        created_at=timestamp,
        updated_at=timestamp,
    )

    response = schemas.BaseStationRead.model_validate(station)

    assert response.metadata == {"network": "mesh"}
    assert response.model_dump()["metadata"] == {"network": "mesh"}


def test_device_schema_reads_metadata_from_orm_attribute() -> None:
    timestamp = datetime(2026, 7, 20)
    device = models.Device(
        id=3,
        slug="sensor-one",
        name="Sensor One",
        device_type="sensor",
        base_station_id=1,
        station_id=2,
        manufacturer=None,
        model=None,
        serial_number=None,
        firmware_version=None,
        is_active=True,
        last_seen_at=None,
        configuration=None,
        metadata_json={"role": "telemetry"},
        created_at=timestamp,
        updated_at=timestamp,
    )

    response = schemas.DeviceRead.model_validate(device)

    assert response.metadata == {"role": "telemetry"}
    assert response.model_dump()["metadata"] == {"role": "telemetry"}
